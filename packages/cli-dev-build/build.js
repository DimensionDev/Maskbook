#!/usr/bin/env node

const { spawn } = require('child_process')
async function main() {
    await require('./ts').build()
    if (process.argv[2] === '--') {
        spawn(process.argv.slice(3).join(' '), { shell: true, stdio: 'inherit' })
    } else {
        require('./main.js')('build')
    }
}
main().catch((e) => {
    throw e
})
