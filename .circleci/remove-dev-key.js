const fs = require('fs')
const path = require('path')

const url = path.join(__dirname, '../dist/manifest.json')
const json = require(url)
delete json.key
delete json.$schema
fs.writeFileSync(url, JSON.stringify(json, undefined, 4), { encoding: 'utf8' })
