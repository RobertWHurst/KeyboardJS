const ttf2woff = require('ttf2woff')
const ttf2woff2 = require('ttf2woff')
const fs = require('fs')
const path = require('path')

const dir = fs.readdirSync('./')

for (const file of dir) {
  const ext = path.extname(file)
  if (ext !== '.woff' && ext !== '.woff2') {
    continue
  }
  console.log(`deleting ${file}`)
  fs.unlinkSync(file)
}

for (const file of dir) {
  const ext = path.extname(file)
  if (ext !== '.ttf') {
    continue
  }
  const basename = path.basename(file, ext)
  console.log(`reading ${basename}.ttf`)
  const ttfSrc = fs.readFileSync(file)
  console.log(`converting ${basename}.ttf to woff`)
  const woffSrc = ttf2woff(ttfSrc)
  console.log(`converting ${basename}.ttf to woff2`)
  const woff2Src = ttf2woff2(ttfSrc)
  console.log(`creating ${basename}.woff`)
  fs.writeFileSync(`${basename}.woff`, woffSrc)
  console.log(`creating ${basename}.woff2`)
  fs.writeFileSync(`${basename}.woff2`, woff2Src)
}
