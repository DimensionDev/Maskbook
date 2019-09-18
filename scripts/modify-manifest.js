const path = require('path')
const fs = require('fs')
const dir = path.join(__dirname, '../build/manifest.json')
const manifest = require(dir)

const platform = process.argv[2]

const modifiers = require('../config-overrides/manifest.overrides')
modifiers[platform](manifest)

fs.writeFileSync(dir, JSON.stringify(manifest))
