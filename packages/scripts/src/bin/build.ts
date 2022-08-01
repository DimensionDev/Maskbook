#!/usr/bin/env ts-node
import { spawn } from 'child_process'
import { codegen } from '../codegen/index.js'
import { awaitChildProcess } from '../utils/index.js'
import { promisify } from 'util'
import { extension } from '../extension/index.js'
import { extensionArgsParser } from './args.js'

await promisify(codegen)()
// \\-- is used for debug
let child
if (process.argv[2] === '--' || process.argv[2] === '\\--') {
    child = spawn(process.argv[3], process.argv.slice(4), {
        stdio: 'inherit',
        shell: true,
    })
} else child = await extension(extensionArgsParser())

if (typeof child === 'number') process.exit(child)
else process.exit(await awaitChildProcess(child))
