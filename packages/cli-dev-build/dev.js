#!/usr/bin/env node

const { spawn } = require('child_process')
async function main() {
    await require('./ts')
        .build()
        .catch(() => {})
    require('./ts').dev()
    if (process.argv[2] === '--') {
        spawn(process.argv.slice(3).join(' '), { shell: true, stdio: 'inherit' })
    } else {
        require('./main.js')('dev')
    }
}
main().catch((e) => {
    throw e
})
