import type { Configuration } from 'webpack'
import { join, isAbsolute } from 'node:path'

export enum ManifestFile {
    ChromiumMV2 = 'chromium-mv2',
    ChromiumMV3 = 'chromium-mv3',
    ChromiumBetaMV3 = 'chromium-beta-mv3',
    FirefoxMV2 = 'firefox-mv2',
    FirefoxMV3 = 'firefox-mv3',
    SafariMV3 = 'safari-mv3',
}
export interface BuildFlags {
    /** If this field is set, manifest.json will copy the content of manifest-*.json */
    manifestFile?: ManifestFile
    mode: 'development' | 'production'
    /** @default 'stable' */
    channel?: 'stable' | 'beta' | 'insider'
    /** @default false */
    profiling?: boolean
    /** @default true in development */
    hmr?: boolean
    /** @default true in development and hmr is true */
    reactRefresh?: boolean
    /** @default false */
    reactCompiler?: boolean | 'infer' | 'annotation' | 'all'
    /** @default false */
    lavamoat?: boolean
    /** @default false */
    csp?: boolean
    outputPath?: string
    /** @default true */
    devtools?: boolean
    /** @default "vscode://file/{path}:{line}" */
    devtoolsEditorURI?: string
    /** @default true */
    sourceMapPreference?: boolean | string
    /** @default true */
    sourceMapHideFrameworks?: boolean | undefined
}
export type NormalizedFlags = Required<BuildFlags>
export function normalizeBuildFlags(flags: BuildFlags): NormalizedFlags {
    const {
        mode,
        profiling = false,
        channel = 'stable',
        devtoolsEditorURI = 'vscode://file/{path}:{line}',
        sourceMapHideFrameworks = true,
        manifestFile = ManifestFile.ChromiumMV3,
        reactCompiler = false,
        lavamoat = false,
        csp = false,
    } = flags
    let {
        hmr = mode === 'development',
        reactRefresh = hmr,
        devtools = mode === 'development' || channel !== 'stable',
        sourceMapPreference = mode === 'development',
        outputPath = join(import.meta.dirname, '../../../', mode === 'development' ? 'dist' : 'build'),
    } = flags
    if (!isAbsolute(outputPath)) outputPath = join(import.meta.dirname, '../../../', outputPath)

    if (manifestFile === ManifestFile.FirefoxMV3) {
        // TODO: Firefox MV3 blocked by website's CSP
        hmr = false
        // TODO: "devtools_page" in manifest.json causes all Promises in browser.* hang
        devtools = false
    }
    if (mode === 'production' || profiling) hmr = false
    if (!hmr) reactRefresh = false

    return {
        mode,
        channel,
        outputPath,
        // Runtime
        manifestFile,
        reactCompiler,
        csp,
        lavamoat,
        // DX
        hmr,
        reactRefresh,
        sourceMapPreference,
        sourceMapHideFrameworks,
        devtools,
        devtoolsEditorURI,
        // CI / profiling
        profiling,
    }
}

export interface ComputedFlags {
    sourceMapKind: Configuration['devtool']
    reactProductionProfiling: boolean
}

export function computedBuildFlags(
    flags: Pick<Required<BuildFlags>, 'mode' | 'sourceMapPreference' | 'profiling' | 'manifestFile' | 'devtools'>,
): ComputedFlags {
    let sourceMapKind: Configuration['devtool'] = false
    if (flags.mode === 'production') sourceMapKind = 'source-map'

    if (flags.sourceMapPreference) {
        // React 19 requires a precise source map to make "Open in Editor" feature work
        if (flags.devtools) sourceMapKind = 'source-map'
        else if (flags.manifestFile.includes('3')) sourceMapKind = 'inline-cheap-source-map'
        else sourceMapKind = 'eval-cheap-source-map'

        if (flags.mode === 'production') sourceMapKind = 'source-map'
        if (typeof flags.sourceMapPreference === 'string') sourceMapKind = flags.sourceMapPreference
        if (process.env.CI) sourceMapKind = false
    }

    const reactProductionProfiling = flags.profiling
    return { sourceMapKind, reactProductionProfiling }
}

export function computeCacheKey(flags: Required<BuildFlags>, computedFlags: ComputedFlags) {
    return [
        '1',
        'node' + process.version,
        flags.mode,
        computedFlags.reactProductionProfiling, // it will affect module resolution of react-dom
        flags.devtools, // it will affect module resolution of react-refresh-webpack-plugin/client/ReactRefreshEntry.js
        flags.reactRefresh, // it will affect all TSX files
    ].join('-')
}
