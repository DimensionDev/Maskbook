#!/usr/bin/env ts-node
import { spawn } from 'child_process'
import { codegen } from '../codegen'
import { awaitChildProcess } from '../utils'
import { promisify } from 'util'
import { extension } from '../extension'
import { extensionArgsParser } from './args'

async function main() {
    await promisify(codegen)()
    // \\-- is used for debug
    if (process.argv[2] === '--' || process.argv[2] === '\\--') {
        return spawn(process.argv[3], process.argv.slice(4), {
            stdio: 'inherit',
            shell: true,
        })
    }
    return extension(extensionArgsParser())
}

main().then(async (child) => {
    typeof child === 'number' ? process.exit(child) : process.exit(await awaitChildProcess(child))
})
