import type { Configuration } from 'webpack'
import type { BuildFlags } from '../../scripts/src/extension/normal'
export type { BuildFlags, Runtime } from '../../scripts/src/extension/normal'

export type NormalizedFlags = ReturnType<typeof normalizeBuildFlags>
export function normalizeBuildFlags(flags: BuildFlags) {
    const { mode = 'development', runtime, profiling = false, readonlyCache = false, outputPath, channel } = flags
    let { hmr = !process.env.NO_HMR && mode === 'development', reactRefresh = hmr, reproducibleBuild = false } = flags
    let { devtools = mode === 'development' || channel !== 'stable' } = flags

    // Firefox requires reproducible build when reviewing the uploaded source code.
    if (runtime.engine === 'firefox' && mode === 'production') reproducibleBuild = true

    // CSP of Twitter bans connection to the HMR server and blocks the app to start.
    if (runtime.engine === 'firefox') hmr = false

    // Not supported yet.
    if (runtime.engine !== 'chromium') devtools = false
    if (runtime.architecture === 'app') devtools = false

    //#region Invariant
    if (mode === 'production') hmr = false
    if (!hmr) reactRefresh = false
    //#endregion

    return {
        mode,
        runtime,
        hmr,
        profiling,
        reactRefresh,
        readonlyCache,
        reproducibleBuild,
        outputPath,
        channel,
        devtools,
    } as const
}

export function computedBuildFlags(flags: ReturnType<typeof normalizeBuildFlags>) {
    const { runtime, mode } = flags
    let sourceMapKind: Configuration['devtool'] = false
    let lockdown = runtime.engine === 'chromium'

    if (runtime.engine === 'safari' && runtime.architecture === 'app') {
        // Due to webextension-polyfill, eval on iOS is async.
        sourceMapKind = false
    } else if (runtime.manifest === 3 && mode === 'development') {
        // MV3 does not allow eval even in production
        sourceMapKind = 'inline-cheap-source-map'
    } else if (mode === 'development') {
        sourceMapKind = 'eval-cheap-source-map'
    } else {
        sourceMapKind = false
    }
    return { sourceMapKind, lockdown } as const
}
