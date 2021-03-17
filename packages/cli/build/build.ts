#!/usr/bin/env ts-node
import { spawn } from 'child_process'
import { awaitChildProcess, ROOT_PATH } from '../utils'
import onMain from './main'
import { build } from './typescript'

async function main() {
    await build()
    if (process.argv[2] === '--') {
        return spawn(process.argv[3], process.argv.slice(4), {
            cwd: ROOT_PATH,
            stdio: 'inherit',
            shell: true,
        })
    }
    return onMain('build')
}

main().then(async (child) => {
    process.exit(await awaitChildProcess(child))
})
