// start a one-time "tsc -b" or parallel "tsc -b -w"

const { spawn } = require('child_process')
const { join, resolve } = require('path')
const Lock = require('./process-lock')
const { runCli } = require('@magic-works/i18n-codegen')

const configFile = resolve(__dirname, '../../.i18n-codegen.json')
const args = { stdio: 'inherit', cwd: join(__dirname, '../..') }
module.exports.dev = async function () {
    lock: for await (const lock of Lock()) {
        if (await lock()) break lock
    }
    runCli({ config: configFile, watch: true })
    spawn('npx', ['tsc', '-b', '-w'], args)
}
module.exports.build = function () {
    return new Promise((resolve, reject) => {
        runCli({ config: configFile })
        const p = spawn('npx', ['tsc', '-b'], args)
        p.on('close', resolve)
        p.on('error', reject)
    })
}
