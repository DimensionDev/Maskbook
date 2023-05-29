export enum Preset {
    Chromium = 'chromium',
    Firefox = 'firefox',
}

export interface BuildFlags {
    engine: 'chromium' | 'firefox'
    /** @default 2 */
    manifest?: 2 | 3
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
    readonlyCache?: boolean
    /** @default false */
    reproducibleBuild?: boolean
    outputPath?: string
    /** @default true */
    devtools?: boolean
    /** @default "vscode://file/{path}:{line}" */
    devtoolsEditorURI?: string
    /** @default true */
    sourceMapPreference?: boolean | string
}

export interface BuildFlagsExtended extends BuildFlags {
    progress?: boolean
}

export function getPreset(preset: Preset | undefined): Pick<BuildFlagsExtended, 'engine' | 'manifest'> {
    if (preset === Preset.Chromium || preset === undefined) return { engine: 'chromium' }
    else if (preset === Preset.Firefox) return { engine: 'firefox', manifest: 2 }
    else throw new Error(`Unknown preset: ${preset}`)
}
