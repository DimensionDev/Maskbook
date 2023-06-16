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

export function getPreset(preset: Preset | undefined): Pick<BuildFlagsExtended, 'engine' | 'manifest'> {
    if (preset === Preset.Chromium || preset === undefined) return { engine: 'chromium' }
    else if (preset === Preset.Firefox) return { engine: 'firefox', manifest: 2 }
    else if (preset === Preset.Safari) return { engine: 'safari', manifest: 3 }
    else throw new Error(`Unknown preset: ${preset}`)
}
