// start a one-time "tsc -b" or parallel "tsc -b -w"

const { spawn } = require('child_process')
const { join } = require('path')
const Lock = require('./process-lock')

const args = { stdio: 'inherit', shell: true, cwd: join(__dirname, '../..') }
module.exports.dev = async function () {
    lock: for await (const lock of Lock()) {
        if (await lock()) break lock
    }
    spawn('tsc', ['-b', '-w'], args)
}
module.exports.build = function () {
    return new Promise((resolve, reject) => {
        const p = spawn('tsc', ['-b'], args)
        p.on('close', resolve)
        p.on('error', reject)
    })
}
