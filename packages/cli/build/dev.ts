#!/usr/bin/env ts-node
import { spawn } from 'child_process'
import { ROOT_PATH } from '../utils'
import onMain from './main'
import { build, dev } from './typescript'

async function main() {
    // await build()
    dev()
    if (process.argv[2] === '--daemon') {
        console.log('Starting TypeScript compiler...')
        // Never ends
        return new Promise<never>((resolve) => {})
    }
    if (process.argv[2] === '--') {
        return spawn(process.argv[3], process.argv.slice(4), {
            stdio: 'inherit',
            shell: true,
            cwd: ROOT_PATH,
        })
    }
    return onMain('dev')
}

main().then((cp) => {
    cp.addListener('exit', (code) => {
        process.exit(code!)
    })
})
