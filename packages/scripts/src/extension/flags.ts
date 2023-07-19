import type { BuildFlags } from '../../../mask/.webpack/flags.js'
export type { BuildFlags } from '../../../mask/.webpack/flags.js'

export interface BuildFlagsExtended extends BuildFlags {
    progress?: boolean
}
