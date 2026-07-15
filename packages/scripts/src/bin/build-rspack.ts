import { spawn } from 'node:child_process'
import { promisify } from 'node:util'
import { series } from 'gulp'
import { codegen } from '../codegen/index.ts'
import { awaitChildProcess, awaitTask } from '../utils/index.ts'
import { buildExtensionFlagRspack } from '../extension/index.ts'
import { extensionArgsParser } from './args.ts'

await promisify(codegen)()
// \\-- is used for debug
if (process.argv[2] === '--' || process.argv[2] === String.raw`\--`) {
    const child = spawn(process.argv[3], process.argv.slice(4), {
        stdio: 'inherit',
        shell: true,
    })
    process.exit(await awaitChildProcess(child))
} else {
    const task = series(buildExtensionFlagRspack('build', extensionArgsParser('production')))
    await awaitTask(task)
}
