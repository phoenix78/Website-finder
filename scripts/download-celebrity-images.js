#!/usr/bin/env node
/**
 * Fetches CC-licensed Wikipedia images for each celebrity,
 * downloads them to public/celebrities/{category}/{slug}/,
 * and updates the corresponding JSON files.
 */

const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'src', 'data', 'celebrities')
const PUBLIC_DIR = path.join(ROOT, 'public', 'celebrities')

// ── Wikipedia page titles per slug ──────────────────────────────────────────
const WIKI_PAGES = {
  // actors
  'brad-pitt':           'Brad_Pitt',
  'leonardo-dicaprio':   'Leonardo_DiCaprio',
  'meryl-streep':        'Meryl_Streep',
  'tom-hanks':           'Tom_Hanks',
  'scarlett-johansson':  'Scarlett_Johansson',
  'angelina-jolie':      'Angelina_Jolie',
  'johnny-depp':         'Johnny_Depp',
  // musicians
  'beyonce':             'Beyoncé',
  'michael-jackson':     'Michael_Jackson',
  'taylor-swift':        'Taylor_Swift',
  'eminem':              'Eminem',
  'rihanna':             'Rihanna',
  'madonna':             'Madonna_(entertainer)',
  // athletes
  'cristiano-ronaldo':   'Cristiano_Ronaldo',
  'lebron-james':        'LeBron_James',
  'serena-williams':     'Serena_Williams',
  'usain-bolt':          'Usain_Bolt',
  'roger-federer':       'Roger_Federer',
  // politicians
  'barack-obama':        'Barack_Obama',
  'angela-merkel':       'Angela_Merkel',
  'emmanuel-macron':     'Emmanuel_Macron',
  'nelson-mandela':      'Nelson_Mandela',
}

function get(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http
    mod.get(url, { headers: { 'User-Agent': 'CelebrityQuiz/1.0 (educational project)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return get(res.headers.location).then(resolve).catch(reject)
      }
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }))
      res.on('error', reject)
    }).on('error', reject)
  })
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http
    const file = fs.createWriteStream(dest)
    mod.get(url, { headers: { 'User-Agent': 'CelebrityQuiz/1.0 (educational project)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close()
        fs.unlinkSync(dest)
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject)
      }
      res.pipe(file)
      file.on('finish', () => file.close(resolve))
      file.on('error', (err) => { fs.unlinkSync(dest); reject(err) })
    }).on('error', reject)
  })
}

async function getWikipediaImage(pageTitle) {
  // Use Wikipedia REST summary API — returns thumbnail + originalimage
  const encoded = encodeURIComponent(pageTitle)
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`
  const { status, body } = await get(url)
  if (status !== 200) throw new Error(`Wikipedia ${status} for ${pageTitle}`)
  const data = JSON.parse(body)
  // Prefer originalimage (higher res), fall back to thumbnail
  const img = data.originalimage || data.thumbnail
  if (!img) throw new Error(`No image found for ${pageTitle}`)
  return {
    url: img.source,
    width: img.width,
    height: img.height,
  }
}

async function processFile(jsonPath, category) {
  const raw = fs.readFileSync(jsonPath, 'utf8')
  const data = JSON.parse(raw)
  const { slug } = data

  const wikiTitle = WIKI_PAGES[slug]
  if (!wikiTitle) {
    console.log(`  ⚠  No wiki mapping for ${slug}, skipping`)
    return
  }

  console.log(`  → ${slug} (${wikiTitle})`)

  let imgInfo
  try {
    imgInfo = await getWikipediaImage(wikiTitle)
  } catch (err) {
    console.log(`     ✗ Wikipedia fetch failed: ${err.message}`)
    return
  }

  // Determine extension
  const ext = imgInfo.url.match(/\.(jpe?g|png|webp|gif)/i)?.[1]?.toLowerCase() || 'jpg'
  const filename = `face.${ext}`
  const destDir = path.join(PUBLIC_DIR, category)
  fs.mkdirSync(destDir, { recursive: true })
  const destPath = path.join(destDir, `${slug}.${ext}`)
  const publicUrl = `/celebrities/${category}/${slug}.${ext}`

  // Download
  try {
    await downloadFile(imgInfo.url, destPath)
    const stat = fs.statSync(destPath)
    console.log(`     ✓ Downloaded ${(stat.size / 1024).toFixed(0)} KB → ${publicUrl}`)
  } catch (err) {
    console.log(`     ✗ Download failed: ${err.message}`)
    return
  }

  // Update JSON images array — keep existing non-face images, replace face
  const faceImage = {
    url: publicUrl,
    type: 'face',
    alt: `${data.name} portrait`,
    width: Math.min(imgInfo.width, 800),
    height: Math.min(imgInfo.height, 800),
  }

  const otherImages = data.images.filter((img) => img.type !== 'face')
  data.images = [faceImage, ...otherImages]

  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n')
  console.log(`     ✓ JSON updated`)
}

async function main() {
  const categories = ['actors', 'musicians', 'athletes', 'politicians']

  for (const cat of categories) {
    console.log(`\n── ${cat.toUpperCase()} ──`)
    const dir = path.join(DATA_DIR, cat)
    if (!fs.existsSync(dir)) continue
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'))

    for (const file of files) {
      await processFile(path.join(dir, file), cat)
      // Small delay to be polite to Wikipedia API
      await new Promise((r) => setTimeout(r, 500))
    }
  }

  console.log('\n✅ Done!')
}

main().catch(console.error)
