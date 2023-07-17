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

export function getPreset(preset: Preset | undefined): Pick<BuildFlagsExtended, 'manifest' | 'mainManifestFile'> {
    if (preset === Preset.Chromium || preset === undefined) return { mainManifestFile: 'chromium-mv2' }
    else if (preset === Preset.Firefox) return { manifest: 2, mainManifestFile: 'firefox-mv2' }
    else if (preset === Preset.Safari) return { manifest: 3, mainManifestFile: 'safari-mv3' }
    else throw new Error(`Unknown preset: ${preset}`)
}
export function applyPresetEnforce(preset: Preset | undefined, flags: BuildFlags): BuildFlags {
    if (preset === Preset.Chromium || preset === undefined) {
    } else if (preset === Preset.Firefox) {
        flags.reproducibleBuild ??= true
        if (flags.reproducibleBuild === false) throw new TypeError('Preset Firefox must use reproducible build')
    } else if (preset === Preset.Safari) {
    } else throw new Error(`Unknown preset: ${preset}`)

    return flags
}
