const { spawn } = require('./spawn')
const path = require('path')

const base = path.join(__dirname, '../')
process.chdir(base)
;(async () => {
    if (process.argv.indexOf('--upgrade') !== -1) await spawn('yarn', ['upgrade', '@holoflows/kit'])
    process.chdir('node_modules/@holoflows/kit')
    await spawn('yarn', ['install'])
    await spawn('yarn', ['build:tsc'])
})()
