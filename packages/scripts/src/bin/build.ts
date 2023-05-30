#!/usr/bin/env ts-node
import { spawn } from 'child_process'
import { codegen } from '../codegen/index.js'
import { awaitChildProcess, awaitTask, ROOT_PATH } from '../utils/index.js'
import { promisify } from 'util'
import { buildExtensionFlag } from '../extension/index.js'
import { extensionArgsParser } from './args.js'
import { series } from 'gulp'
import { buildSandboxedPluginConfigurable } from '../projects/sandboxed-plugins.js'
import { fileURLToPath } from 'url'

await promisify(codegen)()
// \\-- is used for debug
if (process.argv[2] === '--' || process.argv[2] === '\\--') {
    const child = spawn(process.argv[3], process.argv.slice(4), {
        stdio: 'inherit',
        shell: true,
    })
    process.exit(await awaitChildProcess(child))
} else {
    const task = series(
        //
        buildExtensionFlag('build', extensionArgsParser('production')),
        // function buildSandboxedPlugin() {
        // return buildSandboxedPluginConfigurable(fileURLToPath(new URL('./build/', ROOT_PATH)), true)
        // },
    )
    await awaitTask(task)
}
