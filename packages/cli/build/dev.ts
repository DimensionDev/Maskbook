#!/usr/bin/env ts-node
import { spawn } from 'child_process'
import { awaitChildProcess, ROOT_PATH } from '../utils'
import onMain from './main'
import { build, dev } from './typescript'
import { noop } from 'lodash'

async function main() {
    await build()
    dev()
    if (process.argv[2] === '--daemon') {
        console.log('Starting TypeScript compiler...')
        // Never ends
        return new Promise<never>(noop)
    }
    if (process.argv[2] === '--') {
        return spawn(process.argv[3], process.argv.slice(4), {
            cwd: ROOT_PATH,
            stdio: 'inherit',
            shell: true,
        })
    }
    return onMain('dev')
}

main().then(async (child) => {
    process.exit(await awaitChildProcess(child))
})
