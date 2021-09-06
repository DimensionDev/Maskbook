#!/usr/bin/env ts-node
import { spawn } from 'child_process'
import { codegenWatch } from '../codegen'
import { awaitChildProcess } from '../utils'
import { extensionWatch } from '../extension'
import { extensionArgsParser } from './args'

async function main() {
    codegenWatch(console.error)
    // \\-- is used for debug
    if (process.argv[2] === '--' || process.argv[2] === '\\--') {
        return spawn(process.argv[3], process.argv.slice(4), {
            stdio: 'inherit',
            shell: true,
        })
    }
    return await extensionWatch(extensionArgsParser())
}

main().then(async (child) => {
    typeof child === 'number' ? process.exit(child) : process.exit(await awaitChildProcess(child))
})
