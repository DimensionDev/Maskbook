import type { BuildFlags } from '../../../mask/.webpack/flags.js'
export type { BuildFlags } from '../../../mask/.webpack/flags.js'
export enum Preset {
    Chromium = 'chromium',
    Firefox = 'firefox',
    Safari = 'safari',
}

export interface BuildFlagsExtended extends BuildFlags {
    progress?: boolean
}

export function getPreset(preset: Preset | undefined): Pick<BuildFlagsExtended, 'manifest'> {
    if (preset === Preset.Chromium || preset === undefined) return {}
    else if (preset === Preset.Firefox) return { manifest: 2 }
    else if (preset === Preset.Safari) return { manifest: 3 }
    else throw new Error(`Unknown preset: ${preset}`)
}

export function applyPresetEnforce(preset: Preset | undefined, flags: BuildFlags): BuildFlags {
    if (preset === Preset.Chromium || preset === undefined) {
    } else if (preset === Preset.Firefox) {
        flags.reproducibleBuild ??= true
        if (flags.reproducibleBuild === false) throw new TypeError('Firefox requires reproducible build')

        // not recommend on Firefox, not tested.
        flags.hmr = false
    } else if (preset === Preset.Safari) {
    } else throw new Error(`Unknown preset: ${preset}`)

    return flags
}
