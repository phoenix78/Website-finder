#!/usr/bin/env node
/**
 * Sets direct Wikipedia Commons image URLs in each celebrity JSON.
 * No network access required — URLs are hardcoded and loaded by the browser at runtime.
 *
 * To add or correct a URL, update the WIKI_IMAGE_URLS mapping below and re-run:
 *   node scripts/set-wiki-urls.js
 */

const fs = require('fs')
const path = require('path')

const DATA_DIR = path.resolve(__dirname, '..', 'src', 'data', 'celebrities')

// Direct Wikipedia Commons thumbnail URLs.
// Format: https://upload.wikimedia.org/wikipedia/commons/thumb/{a}/{ab}/{Filename}/{w}px-{Filename}
const WIKI_IMAGE_URLS = {
  // ── ACTORS ──────────────────────────────────────────────────────────────────
  'leonardo-dicaprio': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/LeoPTABFI191125-28_%28cropped%29.jpg/500px-LeoPTABFI191125-28_%28cropped%29.jpg',
    width: 500, height: 652,
  },
  'brad-pitt': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Brad_Pitt_2019_by_Glenn_Francis.jpg/500px-Brad_Pitt_2019_by_Glenn_Francis.jpg',
    width: 500, height: 667,
  },
  'tom-hanks': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Tom_Hanks_TIFF_2019.jpg/500px-Tom_Hanks_TIFF_2019.jpg',
    width: 500, height: 625,
  },
  'meryl-streep': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Meryl_Streep_December_2018.jpg/500px-Meryl_Streep_December_2018.jpg',
    width: 500, height: 650,
  },
  'scarlett-johansson': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Scarlett_Johansson_by_Gage_Skidmore_2_%28cropped%29.jpg/500px-Scarlett_Johansson_by_Gage_Skidmore_2_%28cropped%29.jpg',
    width: 500, height: 608,
  },
  'angelina-jolie': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Angelina_Jolie_2_June_2014_%28cropped%29.jpg/500px-Angelina_Jolie_2_June_2014_%28cropped%29.jpg',
    width: 500, height: 620,
  },
  'johnny-depp': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Johnny_Depp_-_SDCC_2015.jpg/500px-Johnny_Depp_-_SDCC_2015.jpg',
    width: 500, height: 600,
  },

  // ── MUSICIANS ───────────────────────────────────────────────────────────────
  'beyonce': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Beyonc%C3%A9_at_The_Lion_King_European_Premiere_2019.png/500px-Beyonc%C3%A9_at_The_Lion_King_European_Premiere_2019.png',
    width: 500, height: 562,
  },
  'michael-jackson': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Michael_Jackson_-_Stranger_in_Moscow_%28music_video%29_1.jpg/500px-Michael_Jackson_-_Stranger_in_Moscow_%28music_video%29_1.jpg',
    width: 500, height: 600,
  },
  'taylor-swift': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/191125_Taylor_Swift_at_the_2019_American_Music_Awards_%28cropped%29.png/500px-191125_Taylor_Swift_at_the_2019_American_Music_Awards_%28cropped%29.png',
    width: 500, height: 600,
  },
  'eminem': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Eminem_-_Concert_for_Valor_in_Washington%2C_D.C._Nov._11%2C_2014_%281%29_%28Gage_Skidmore%29.jpg/500px-Eminem_-_Concert_for_Valor_in_Washington%2C_D.C._Nov._11%2C_2014_%281%29_%28Gage_Skidmore%29.jpg',
    width: 500, height: 598,
  },
  'rihanna': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Rihanna_-_Barclay_Center_-_17th_November_2013_%28cropped%29.jpg/500px-Rihanna_-_Barclay_Center_-_17th_November_2013_%28cropped%29.jpg',
    width: 500, height: 600,
  },
  'madonna': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Madonna_-_2008_%28cropped%29.jpg/500px-Madonna_-_2008_%28cropped%29.jpg',
    width: 500, height: 600,
  },

  // ── ATHLETES ────────────────────────────────────────────────────────────────
  'cristiano-ronaldo': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cristiano_Ronaldo_2018.jpg/500px-Cristiano_Ronaldo_2018.jpg',
    width: 500, height: 600,
  },
  'lebron-james': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/LeBron_James_crop.jpg/500px-LeBron_James_crop.jpg',
    width: 500, height: 600,
  },
  'serena-williams': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Serena_Williams_at_2013_US_Open.jpg/500px-Serena_Williams_at_2013_US_Open.jpg',
    width: 500, height: 600,
  },
  'usain-bolt': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Usain_Bolt_by_Michael_Alberstat.jpg/500px-Usain_Bolt_by_Michael_Alberstat.jpg',
    width: 500, height: 600,
  },
  'roger-federer': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Roger_Federer_2018_Wimbledon.jpg/500px-Roger_Federer_2018_Wimbledon.jpg',
    width: 500, height: 600,
  },

  // ── POLITICIANS ─────────────────────────────────────────────────────────────
  'barack-obama': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/President_Barack_Obama.jpg/800px-President_Barack_Obama.jpg',
    width: 800, height: 1006,
  },
  'angela-merkel': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Angela_Merkel_2019_cropped.jpg/500px-Angela_Merkel_2019_cropped.jpg',
    width: 500, height: 600,
  },
  'emmanuel-macron': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Emmanuel_Macron_in_2019.jpg/500px-Emmanuel_Macron_in_2019.jpg',
    width: 500, height: 600,
  },
  'nelson-mandela': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Nelson_Mandela_1994.jpg/800px-Nelson_Mandela_1994.jpg',
    width: 800, height: 1018,
  },
}

function processFile(jsonPath) {
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
  const { slug, name } = data

  const entry = WIKI_IMAGE_URLS[slug]
  if (!entry) {
    console.log(`  ⚠  No URL mapping for ${slug}, skipping`)
    return
  }

  const faceImage = {
    url: entry.url,
    type: 'face',
    alt: `${name} — portrait Wikipedia`,
    width: entry.width,
    height: entry.height,
  }

  // Replace face image, keep other image types (full-body, body-part)
  data.images = [faceImage, ...data.images.filter((img) => img.type !== 'face')]

  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n')
  console.log(`  ✓  ${slug}`)
}

const categories = ['actors', 'musicians', 'athletes', 'politicians']
for (const cat of categories) {
  console.log(`\n── ${cat.toUpperCase()} ──`)
  const dir = path.join(DATA_DIR, cat)
  if (!fs.existsSync(dir)) continue
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    processFile(path.join(dir, file))
  }
}
console.log('\n✅ Done!')
