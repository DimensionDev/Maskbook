import { compact } from 'lodash-es'
import { awaitChildProcess } from '../utils/awaitChildProcess.ts'
import { PKG_PATH } from '../utils/paths.ts'
import { shell } from '../utils/run.ts'
import type { BuildFlagsExtended } from './flags.ts'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

export async function extensionWatch(f: BuildFlagsExtended) {
    return runBundler('webpack', f)
}
export async function extensionWatchRspack(f: BuildFlagsExtended) {
    return runBundler('rspack', f)
}

export async function runBundler(builder: 'webpack' | 'rspack', flags: BuildFlagsExtended) {
    const argv = [
        '--mode',
        flags.mode === 'development' ? 'development' : 'production',
        flags.progress && '--progress',
        flags.profiling && '--profile',
        // this command runs in the /packages/mask folder.
        flags.profiling && '--json=../../compilation-stats.json',
    ]
    argv.push('--env', 'flags=' + Buffer.from(JSON.stringify(flags), 'utf-8').toString('hex'))

    if (builder === 'rspack') {
        const rspack_argv = [
            flags.mode === 'development' ? 'serve' : 'build',
            ...argv,
            '--config',
            createRequire(import.meta.url).resolve('../../../mask/.webpack/rspack.config.js'),
        ]
        const rspack = await import('@rspack/cli')
        const cli = new rspack.RspackCLI()
        console.log('$ node ./packages/mask/node_modules/@rspack/cli/bin/rspack.js', ...compact(rspack_argv))
        return cli.run(['node', 'rspack', ...compact(rspack_argv)])
    } else {
        const command = [
            JSON.stringify(process.execPath),
            '--experimental-strip-types',
            fileURLToPath(import.meta.resolve('./init.js')),
            flags.mode === 'development' ? 'serve' : undefined,
            ...argv,
        ]
        return awaitChildProcess(shell.cwd(new URL('mask', PKG_PATH))([compact(command).join(' ')]))
    }
}
