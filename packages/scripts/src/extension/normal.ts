import yargs, { Argv } from 'yargs'
import { hideBin } from 'yargs/helpers'
import { compact } from 'lodash-unified'
import { awaitChildProcess, PKG_PATH, shell, task, watchTask } from '../utils/index.js'
import { buildInjectedScript, watchInjectedScript } from '../projects/injected-scripts.js'
import { buildMaskSDK, watchMaskSDK } from '../projects/mask-sdk.js'
import { buildPolyfill } from '../projects/polyfill.js'
import { buildGun } from '../projects/gun.js'
import { parallel, series, TaskFunction } from 'gulp'

const presets = ['chromium', 'firefox', 'android', 'iOS', 'base'] as const
const otherFlags = ['beta', 'insider', 'reproducible', 'profile', 'mv3', 'readonlyCache', 'progress'] as const

export function buildWebpackFlag(name: string, args: ExtensionBuildArgs | undefined) {
    const f = () => awaitChildProcess(webpack('build', args))
    const desc = 'Build webpack for ' + name
    task(f, desc, desc)
    return f
}
export function buildExtensionFlag(name: string, args: ExtensionBuildArgs | undefined): TaskFunction {
    const f = series(parallel(buildPolyfill, buildInjectedScript, buildGun, buildMaskSDK), buildWebpackFlag(name, args))
    const desc = 'Build extension for ' + name
    task(f, desc, desc)
    return f
}
export const buildBaseExtension: TaskFunction = buildExtensionFlag('default', undefined)
export async function extensionWatch(f?: Function | ExtensionBuildArgs) {
    buildPolyfill()
    buildGun()
    watchInjectedScript()
    watchMaskSDK()
    if (typeof f === 'function') return awaitChildProcess(webpack('dev'))
    return awaitChildProcess(webpack('dev', f))
}
watchTask(buildBaseExtension, extensionWatch, 'webpack', 'Build Mask Network extension', {
    '[Warning]': 'For normal development, use task "dev" or "build"',
})

function parseArgs() {
    const a = yargs(hideBin(process.argv))
    for (const i of presets) a.option(i, { type: 'boolean' })
    for (const i of otherFlags) a.option(i, { type: 'boolean' })
    const b = a as Argv<Record<typeof presets[number] | typeof otherFlags[number], boolean>>
    return b.string('output-path')
}
export type ExtensionBuildArgs = {
    mv3?: boolean
    android?: boolean
    iOS?: boolean
    firefox?: boolean
    insider?: boolean
    beta?: boolean
    chromium?: boolean
    base?: boolean
    readonlyCache?: boolean
    reproducible?: boolean
    profile?: boolean
    progress?: boolean
    ['output-path']?: string
}
function webpack(mode: 'dev' | 'build', args: ExtensionBuildArgs = parseArgs().argv as any) {
    const command = [
        'webpack',
        mode === 'dev' ? 'serve' : undefined,
        '--mode',
        mode === 'dev' ? 'development' : 'production',
        args.progress && '--progress',
        args.profile && '--profile',
        // this command runs in the /packages/mask folder.
        args.profile && '--json=../../compilation-stats.json',
    ]
    const flags: BuildFlags = {
        channel: 'stable',
        mode: mode === 'dev' ? 'development' : 'production',
        runtime: { architecture: 'web', engine: 'chromium', manifest: 2 },
    }
    if (args.reproducible) flags.reproducibleBuild = true
    if (args.readonlyCache) flags.readonlyCache = true
    if (args.profile) flags.profiling = true
    if (args['output-path']) flags.outputPath = args['output-path']

    if (args.mv3) {
        flags.runtime.manifest = 3
        if (args.android || args.iOS || args.firefox) throw new Error("Current engine doesn't support MV3.")
    }

    if (args.insider) flags.channel = 'insider'
    else if (args.beta) flags.channel = 'beta'

    if (args.iOS) {
        flags.runtime.engine = 'safari'
        flags.runtime.architecture = 'app'
    } else if (args.firefox) {
        flags.runtime.engine = 'firefox'
        flags.runtime.architecture = 'web'
    } else if (args.android) {
        flags.runtime.engine = 'firefox'
        flags.runtime.architecture = 'app'
    } else if (args.chromium || args.base) {
        flags.runtime.engine = 'chromium'
        flags.runtime.architecture = 'web'
    }

    command.push('--env', 'flags=' + Buffer.from(JSON.stringify(flags), 'utf-8').toString('hex'))
    return shell.cwd(new URL('mask', PKG_PATH))(['npx ' + compact(command).join(' ')])
}
export interface Runtime {
    engine: 'chromium' | 'firefox' | 'safari'
    architecture: 'web' | 'app'
    manifest: 2 | 3
}
export interface BuildFlags {
    channel: 'stable' | 'beta' | 'insider'
    runtime: Runtime
    mode: 'development' | 'production'
    /** @default false */
    profiling?: boolean
    /** @default true in development */
    hmr?: boolean
    /** @default true in development and hmr is true */
    reactRefresh?: boolean
    /** @default false */
    readonlyCache?: boolean
    /** @default false */
    reproducibleBuild?: boolean
    outputPath?: string
}
