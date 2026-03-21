#!/usr/bin/env node
/**
 * Generates styled SVG portrait placeholders for each celebrity
 * and updates the JSON files to point to them.
 * Each SVG has a unique color palette + initials + name.
 */

const fs = require('fs')
const path = require('path')

const ROOT     = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'src', 'data', 'celebrities')
const PUB_DIR  = path.join(ROOT, 'public', 'celebrities')

// ── Color palettes per category ──────────────────────────────────────────────
const PALETTES = {
  actors:      ['#6366f1','#8b5cf6','#a78bfa','#4f46e5','#7c3aed','#9333ea','#c084fc'],
  musicians:   ['#ec4899','#f43f5e','#fb7185','#e11d48','#be123c','#f472b6','#db2777'],
  athletes:    ['#10b981','#059669','#34d399','#047857','#065f46','#6ee7b7','#0d9488'],
  politicians: ['#f59e0b','#d97706','#fbbf24','#b45309','#92400e','#fcd34d','#e97c12'],
}

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

function hashString(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

function makeFaceSVG(name, category, slug) {
  const pal   = PALETTES[category] || PALETTES.actors
  const idx   = hashString(slug) % pal.length
  const bg    = pal[idx]
  const bg2   = pal[(idx + 2) % pal.length]
  const init  = getInitials(name)
  const shortName = name.split(' ').slice(-1)[0]  // last name

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <radialGradient id="bg" cx="40%" cy="35%" r="70%">
      <stop offset="0%" stop-color="${bg2}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="1"/>
    </radialGradient>
    <radialGradient id="circle" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.15"/>
    </radialGradient>
  </defs>
  <!-- Background -->
  <rect width="400" height="400" fill="url(#bg)"/>
  <!-- Subtle noise texture via circles -->
  <circle cx="200" cy="200" r="195" fill="url(#circle)"/>
  <!-- Shoulder silhouette -->
  <ellipse cx="200" cy="490" rx="145" ry="120" fill="#00000033"/>
  <!-- Head circle -->
  <circle cx="200" cy="185" r="100" fill="#ffffff22"/>
  <circle cx="200" cy="185" r="96" fill="#ffffff18"/>
  <!-- Initials -->
  <text
    x="200" y="210"
    font-family="system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
    font-size="88"
    font-weight="900"
    text-anchor="middle"
    fill="#ffffff"
    opacity="0.95"
    letter-spacing="-2"
  >${init}</text>
  <!-- Name bar -->
  <rect x="0" y="335" width="400" height="65" fill="#00000055"/>
  <text
    x="200" y="377"
    font-family="system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
    font-size="24"
    font-weight="700"
    text-anchor="middle"
    fill="#ffffff"
    opacity="0.95"
    letter-spacing="1"
  >${name.toUpperCase()}</text>
</svg>`
}

function makeBodyPartSVG(name, category, slug, part) {
  const pal  = PALETTES[category] || PALETTES.actors
  const idx  = hashString(slug + part) % pal.length
  const bg   = pal[idx]
  const partEmojis = { eyes: '👁', mouth: '👄', hands: '🤲', silhouette: '🕴', back: '🔙' }
  const emoji = partEmojis[part] || '?'

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="${pal[(idx+3)%pal.length]}" stop-opacity="1"/>
    </linearGradient>
  </defs>
  <rect width="400" height="250" fill="url(#bg)"/>
  <text x="200" y="130" font-size="80" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
  <rect x="0" y="195" width="400" height="55" fill="#00000055"/>
  <text
    x="200" y="227"
    font-family="system-ui, sans-serif"
    font-size="20"
    font-weight="700"
    text-anchor="middle"
    fill="#ffffff"
    opacity="0.9"
  >${name.toUpperCase()} · ${part.toUpperCase()}</text>
</svg>`
}

// ── Process one JSON file ────────────────────────────────────────────────────
function processFile(jsonPath, category) {
  const raw  = fs.readFileSync(jsonPath, 'utf8')
  const data = JSON.parse(raw)
  const { slug, name } = data

  const outDir = path.join(PUB_DIR, category)
  fs.mkdirSync(outDir, { recursive: true })

  const newImages = []

  // 1. Face image
  const facePath = path.join(outDir, `${slug}.svg`)
  fs.writeFileSync(facePath, makeFaceSVG(name, category, slug))
  newImages.push({
    url: `/celebrities/${category}/${slug}.svg`,
    type: 'face',
    alt: `${name} — portrait`,
    width: 400,
    height: 400,
  })

  // 2. Full-body (same SVG, different label for now)
  const fullPath = path.join(outDir, `${slug}-full.svg`)
  fs.writeFileSync(fullPath, makeFaceSVG(name, category, slug))
  newImages.push({
    url: `/celebrities/${category}/${slug}-full.svg`,
    type: 'full-body',
    alt: `${name} — full body`,
    width: 400,
    height: 400,
  })

  // 3. Body-part images (from existing data, regenerate as SVG)
  const existingParts = (data.images || []).filter((img) => img.type === 'body-part')
  const partsToMake = existingParts.length > 0
    ? existingParts.map((img) => img.bodyPart).filter(Boolean)
    : ['eyes']

  for (const part of partsToMake) {
    const partPath = path.join(outDir, `${slug}-${part}.svg`)
    fs.writeFileSync(partPath, makeBodyPartSVG(name, category, slug, part))
    newImages.push({
      url: `/celebrities/${category}/${slug}-${part}.svg`,
      type: 'body-part',
      bodyPart: part,
      alt: `${name} — ${part}`,
      width: 400,
      height: 250,
    })
  }

  data.images = newImages
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n')
  console.log(`  ✓ ${name} — ${newImages.length} images`)
}

// ── Main ─────────────────────────────────────────────────────────────────────
const categories = ['actors', 'musicians', 'athletes', 'politicians']
let total = 0
for (const cat of categories) {
  console.log(`\n── ${cat.toUpperCase()} ──`)
  const dir = path.join(DATA_DIR, cat)
  if (!fs.existsSync(dir)) continue
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    processFile(path.join(dir, file), cat)
    total++
  }
}
console.log(`\n✅ Generated SVGs for ${total} celebrities.`)
