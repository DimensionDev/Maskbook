#!/usr/bin/env node --import swc-register-esm
import { spawn } from 'child_process'
import { promisify } from 'util'
import { series } from 'gulp'
import { codegen } from '../codegen/index.js'
import { awaitChildProcess, awaitTask } from '../utils/index.js'
import { buildExtensionFlagRspack } from '../extension/index.js'
import { extensionArgsParser } from './args.js'

await promisify(codegen)()
// \\-- is used for debug
if (process.argv[2] === '--' || process.argv[2] === '\\--') {
    const child = spawn(process.argv[3], process.argv.slice(4), {
        stdio: 'inherit',
        shell: true,
    })
    process.exit(await awaitChildProcess(child))
} else {
    const task = series(buildExtensionFlagRspack('build', extensionArgsParser('production')))
    await awaitTask(task)
}
