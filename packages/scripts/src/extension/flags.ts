import { ManifestFile, type BuildFlags } from '../../../mask/.webpack/flags.js'
export type { BuildFlags } from '../../../mask/.webpack/flags.js'

export interface BuildFlagsExtended extends BuildFlags {
    progress?: boolean
}

export function applyPresetEnforce(flags: BuildFlagsExtended): BuildFlags {
    if (flags.manifestFile === ManifestFile.FirefoxMV2 || flags.manifestFile === ManifestFile.FirefoxMV3) {
        flags.reproducibleBuild ??= true
        if (flags.reproducibleBuild === false) throw new TypeError('Preset Firefox must use reproducible build')
    }

    return flags
}
