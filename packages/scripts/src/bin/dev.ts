#!/usr/bin/env ts-node
import { spawn } from 'child_process'
import { codegenWatch } from '../codegen/index.js'
import { awaitChildProcess } from '../utils/index.js'
import { extensionWatch } from '../extension/index.js'
import { extensionArgsParser } from './args.js'

codegenWatch(console.error)
// \\-- is used for debug
let child
if (process.argv[2] === '--' || process.argv[2] === '\\--') {
    child = spawn(process.argv[3], process.argv.slice(4), {
        stdio: 'inherit',
        shell: true,
    })
} else child = await extensionWatch(extensionArgsParser())

if (typeof child === 'number') process.exit(child)
else process.exit(await awaitChildProcess(child))
