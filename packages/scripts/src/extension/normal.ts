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

export function buildWebpackFlag(name: string, args: BuildFlagsExtended) {
    const f = () => awaitChildProcess(webpack(args))
    const desc = 'Build webpack for ' + name
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
export const buildBaseExtension: TaskFunction = buildExtensionFlag('default', {
    manifestFile: ManifestFile.ChromiumMV3,
    channel: 'stable',
    mode: 'production',
})

export async function extensionWatch(f: Function | BuildFlagsExtended) {
    cleanupWhenExit()
    buildPolyfill()
    buildGun()
    watchInjectedScript()
    watchMaskSDK()
    buildSentry()
    if (typeof f === 'function') {
        const flags: BuildFlags = {
            manifestFile: ManifestFile.ChromiumMV3,
            channel: 'stable',
            mode: 'development',
        }
        applyDotEnv(flags)
        return awaitChildProcess(webpack(flags))
    }
    return awaitChildProcess(webpack(f))
}
watchTask(buildBaseExtension, extensionWatch, 'webpack', 'Build Mask Network extension', {
    '[Warning]': 'For normal development, use task "dev" or "build"',
})

function webpack(flags: BuildFlagsExtended) {
    const command = [
        JSON.stringify(process.execPath),
        '--import',
        '@swc-node/register/esm-register',
        fileURLToPath(import.meta.resolve('./init.js')),
        flags.mode === 'development' ? 'serve' : undefined,
        '--mode',
        flags.mode === 'development' ? 'development' : 'production',
        flags.progress && '--progress',
        flags.profiling && '--profile',
        // this command runs in the /packages/mask folder.
        flags.profiling && '--json=../../compilation-stats.json',
    ]
    command.push('--env', 'flags=' + Buffer.from(JSON.stringify(flags), 'utf-8').toString('hex'))
    return shell.cwd(new URL('mask', PKG_PATH))([compact(command).join(' ')])
}
