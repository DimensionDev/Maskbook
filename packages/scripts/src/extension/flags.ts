export enum Preset {
    Chromium = 'chromium',
    Android = 'android',
    Firefox = 'firefox',
    iOS = 'iOS',
}

export interface BuildFlags {
    engine: 'chromium' | 'firefox' | 'safari'
    architecture: 'web' | 'app'
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
    sourceMapPreference?: boolean | string
}

export interface BuildFlagsExtended extends BuildFlags {
    progress?: boolean
}

export function getPreset(
    preset: Preset | undefined,
): Pick<BuildFlagsExtended, 'architecture' | 'engine' | 'manifest'> {
    if (preset === Preset.Chromium || preset === undefined)
        return { architecture: 'web', engine: 'chromium', manifest: 3 }
    else if (preset === Preset.Firefox) return { architecture: 'web', engine: 'firefox', manifest: 2 }
    else if (preset === Preset.Android) return { architecture: 'app', engine: 'firefox', manifest: 2 }
    else if (preset === Preset.iOS) return { architecture: 'app', engine: 'safari', manifest: 2 }
    else throw new Error(`Unknown preset: ${preset}`)
}
