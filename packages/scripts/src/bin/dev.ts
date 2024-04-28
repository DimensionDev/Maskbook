#!/usr/bin/env node --import swc-register-esm
import { spawn } from 'child_process'
import { codegenWatch } from '../codegen/index.js'
import { awaitChildProcess, cleanupWhenExit } from '../utils/index.js'
import { extensionWatch } from '../extension/index.js'
import { extensionArgsParser } from './args.js'

cleanupWhenExit()
codegenWatch(console.error)
// \\-- is used for debug
if (process.argv[2] === '--' || process.argv[2] === '\\--') {
    const child = spawn(process.argv[3], process.argv.slice(4), {
        stdio: 'inherit',
        shell: true,
    })
    process.exit(await awaitChildProcess(child))
} else {
    const builder = await extensionWatch(extensionArgsParser('development'))
    if (builder) process.exit(builder)
}
