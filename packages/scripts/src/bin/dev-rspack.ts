import { spawn } from 'node:child_process'
import { codegenWatch } from '../codegen/index.ts'
import { awaitChildProcess, cleanupWhenExit } from '../utils/index.ts'
import { extensionWatchRspack } from '../extension/index.ts'
import { extensionArgsParser } from './args.ts'

cleanupWhenExit()
codegenWatch(console.error)
// \\-- is used for debug
if (process.argv[2] === '--' || process.argv[2] === String.raw`\--`) {
    const child = spawn(process.argv[3], process.argv.slice(4), {
        stdio: 'inherit',
        shell: true,
    })
    process.exit(await awaitChildProcess(child))
} else {
    const builder = await extensionWatchRspack(extensionArgsParser('development'))
    if (builder) process.exit(builder)
}
