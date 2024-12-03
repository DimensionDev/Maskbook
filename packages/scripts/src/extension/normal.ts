import { compact } from 'lodash-es'
import { awaitChildProcess, cleanupWhenExit, PKG_PATH, shell, task, watchTask } from '../utils/index.js'
import { buildInjectedScript, watchInjectedScript } from '../projects/injected-scripts.js'
import { buildMaskSDK, watchMaskSDK } from '../projects/mask-sdk.js'
import { buildPolyfill } from '../projects/polyfill.js'
import { buildGun } from '../projects/gun.js'
import { parallel, series, type TaskFunction } from 'gulp'
import { buildSentry } from '../projects/sentry.js'
import type { BuildFlags, BuildFlagsExtended } from './flags.js'
import { ManifestFile } from '../../../mask/.webpack/flags.js'
import { applyDotEnv } from './dotenv.js'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

export function buildWebpackFlag(name: string, args: BuildFlagsExtended) {
    const f = () => webpack(false, args)
    const desc = 'Build webpack for ' + name
    task(f, desc, desc)
    return f
}
export function buildRspackFlag(name: string, args: BuildFlagsExtended) {
    const f = () => webpack(true, args)
    const desc = 'Build rspack for ' + name
    task(f, desc, desc)
    return f
}
export function buildExtensionFlag(name: string, args: BuildFlagsExtended): TaskFunction {
    const f = series(
        parallel(buildPolyfill, buildInjectedScript, buildGun, buildMaskSDK, buildSentry),
        buildWebpackFlag(name, args),
    )
    const desc = 'Build extension for ' + name
    task(f, desc, desc)
    return f
}
export function buildExtensionFlagRspack(name: string, args: BuildFlagsExtended): TaskFunction {
    const f = series(
        parallel(buildPolyfill, buildInjectedScript, buildGun, buildMaskSDK, buildSentry),
        buildRspackFlag(name, args),
    )
    const desc = 'Build extension for ' + name + ' with rspack'
    task(f, desc, desc)
    return f
}
export const buildBaseExtension: TaskFunction = buildExtensionFlag('default', {
    manifestFile: ManifestFile.ChromiumMV3,
    channel: 'stable',
    mode: 'production',
})
export const buildBaseExtensionRspack: TaskFunction = buildExtensionFlagRspack('default', {
    manifestFile: ManifestFile.ChromiumMV3,
    channel: 'stable',
    mode: 'production',
})

function preTask() {
    cleanupWhenExit()
    buildPolyfill()
    buildGun()
    watchInjectedScript()
    watchMaskSDK()
    buildSentry()
}
export async function extensionWatch(f: Function | BuildFlagsExtended) {
    preTask()
    if (typeof f === 'function') {
        const flags: BuildFlags = {
            manifestFile: ManifestFile.ChromiumMV3,
            channel: 'stable',
            mode: 'development',
        }
        applyDotEnv(flags)
        return webpack(false, flags)
    }
    return webpack(false, f)
}
export async function extensionWatchRspack(f: Function | BuildFlagsExtended) {
    preTask()
    if (typeof f === 'function') {
        const flags: BuildFlags = {
            manifestFile: ManifestFile.ChromiumMV3,
            channel: 'stable',
            mode: 'development',
        }
        applyDotEnv(flags)
        return webpack(true, flags)
    }
    return webpack(true, f)
}
watchTask(buildBaseExtension, extensionWatch, 'webpack', 'Build Mask Network extension', {
    '[Warning]': 'For normal development, use task "dev" or "build"',
})
watchTask(buildBaseExtensionRspack, extensionWatchRspack, 'rspack', 'Build Mask Network extension with rspack', {
    '[Warning]': 'For normal development, use task "dev-rspack" or "build-rspack"',
})

async function webpack(rspack: boolean, flags: BuildFlagsExtended) {
    const argv = [
        '--mode',
        flags.mode === 'development' ? 'development' : 'production',
        flags.progress && '--progress',
        flags.profiling && '--profile',
        // this command runs in the /packages/mask folder.
        flags.profiling && '--json=../../compilation-stats.json',
    ]
    argv.push('--env', 'flags=' + Buffer.from(JSON.stringify(flags), 'utf-8').toString('hex'))

    if (rspack) {
        const rspack_argv = [
            flags.mode === 'development' ? 'serve' : 'build',
            ...argv,
            '--config',
            createRequire(import.meta.url).resolve('../../../mask/.webpack/rspack.config.js'),
        ]
        const rspack = await import('@rspack/cli')
        const cli = new rspack.RspackCLI()
        console.log(
            '$ node --import @swc-node/register/esm-register ./packages/mask/node_modules/@rspack/cli/bin/rspack.js',
            ...compact(rspack_argv),
        )
        return cli.run(['node', 'rspack', ...compact(rspack_argv)])
    } else {
        const command = [
            JSON.stringify(process.execPath),
            '--import',
            '@swc-node/register/esm-register',
            fileURLToPath(import.meta.resolve(rspack ? 'rspack/bin/rspack.js' : './init.js')),
            flags.mode === 'development' ? 'serve' : undefined,
            ...argv,
        ]
        return awaitChildProcess(shell.cwd(new URL('mask', PKG_PATH))([compact(command).join(' ')]))
    }
}
