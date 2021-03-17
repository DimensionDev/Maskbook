#!/usr/bin/env ts-node
import { spawn } from 'child_process'
import { ROOT_PATH } from '../utils'
import onMain from './main'
import { build } from './typescript'

async function main() {
    await build()
    if (process.argv[2] === '--') {
        return spawn(process.argv[3], process.argv.slice(4), {
            stdio: 'inherit',
            shell: true,
            cwd: ROOT_PATH,
        })
    }
    return onMain('build')
}

main().then((p) => {
    p.addListener('exit', (code) => {
        process.exit(code)
    })
})
