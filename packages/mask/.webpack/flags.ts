import type { Configuration } from 'webpack'
import { BuildFlags } from '../../scripts/src/extension/flags'
import { join, isAbsolute } from 'path'

export type { BuildFlags } from '../../scripts/src/extension/flags'

export type NormalizedFlags = Required<BuildFlags>
export function normalizeBuildFlags(flags: BuildFlags): NormalizedFlags {
    const {
        mode,
        profiling = false,
        engine,
        architecture,
        manifest = 2,
        readonlyCache = false,
        channel = 'stable',
    } = flags
    let {
        hmr = mode === 'development',
        reactRefresh = hmr,
        reproducibleBuild = false,
        devtools = mode === 'development' || channel !== 'stable',
        sourceMapPreference = mode === 'development',
        outputPath = join(__dirname, '../../../', mode === 'development' ? 'dist' : 'build'),
    } = flags
    if (!isAbsolute(outputPath)) outputPath = join(__dirname, '../../../', outputPath)

    // Firefox requires reproducible build when reviewing the uploaded source code.
    if (engine === 'firefox' && mode === 'production') reproducibleBuild = true

    // CSP of Twitter bans connection to the HMR server and blocks the app to start.
    if (engine === 'firefox') hmr = false

    // React Devtools integration is not supported in Firefox or App yet.
    if (engine !== 'chromium' || architecture === 'app') devtools = false

    if (mode === 'production') hmr = false
    if (!hmr) reactRefresh = false

    return {
        mode,
        channel,
        outputPath,
        // Runtime
        manifest,
        architecture,
        engine,
        // DX
        hmr,
        reactRefresh,
        sourceMapPreference,
        devtools,
        // CI / profiling
        profiling,
        readonlyCache,
        reproducibleBuild,
    }
}

export interface ComputedFlags {
    lockdown: boolean
    sourceMapKind: Configuration['devtool']
    supportDynamicImport: boolean
    reactProductionProfiling: boolean
}

export function computedBuildFlags(flags: Required<BuildFlags>): ComputedFlags {
    const lockdown = flags.engine === 'chromium'

    let sourceMapKind: Configuration['devtool'] = false
    if (flags.sourceMapPreference) {
        if (flags.manifest === 3) sourceMapKind = 'inline-cheap-source-map'
        else sourceMapKind = 'eval-cheap-source-map'

        if (flags.mode === 'production') sourceMapKind = 'source-map'
        if (typeof flags.sourceMapPreference === 'string') sourceMapKind = flags.sourceMapPreference
        if (process.env.CI) sourceMapKind = false
    }

    const supportDynamicImport = !(flags.engine === 'safari' && flags.architecture === 'app')
    const reactProductionProfiling = flags.mode === 'production' && flags.profiling
    return { sourceMapKind, lockdown, supportDynamicImport, reactProductionProfiling }
}

export function computeCacheKey(flags: Required<BuildFlags>, computedFlags: ComputedFlags) {
    return [
        '1',
        'node' + process.version,
        flags.mode,
        computedFlags.supportDynamicImport, // it will generate different code
        computedFlags.reactProductionProfiling, // it will affect module resolution of react-dom
        flags.devtools, // it will affect module resolution of react-refresh-webpack-plugin/client/ReactRefreshEntry.js
        flags.reactRefresh, // it will affect all TSX files
    ].join('-')
}
