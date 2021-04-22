#!/usr/bin/env ts-node
import { spawn } from 'child_process'
import { awaitChildProcess } from '../utils'
import onMain from './main'
import { build, dev } from './typescript'
import { noop } from 'lodash'
import { isLocked } from './process-lock'

async function main() {
    if (process.argv[2] === '--daemon') {
        console.log('Starting TypeScript compiler...')
        return dev()
    }

    if (!isLocked()) {
        console.log('Starting a full TypeScript build...')
        await build().catch(noop)
    }
    dev()
    if (process.argv[2] === '--') {
        return spawn(process.argv[3], process.argv.slice(4), {
            stdio: 'inherit',
            shell: true,
        })
    }
    return onMain('dev')
}

main().then(async (child) => {
    process.exit(await awaitChildProcess(child))
})
