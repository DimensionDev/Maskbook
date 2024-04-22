import type { ProfileIdentifier } from '@masknet/shared-base'

// This file should be a .ts file, not a .d.ts file (that skips type checking).
// but this causes "because it would overwrite input file" error in incremental compiling which is annoying.
export declare namespace SiteAdaptor {
    export interface DeclarativePermissions {
        origins: readonly string[]
    }
    export interface Definition {
        name: string
        networkIdentifier: string
        // Note: if declarativePermissions is no longer sufficient, use "false" to indicate it need a load().
        declarativePermissions: DeclarativePermissions
        homepage: string
        notReadyForProduction?: boolean
        /** Whether this provider need to connect persona */
        isSocialNetwork?: boolean
        sortIndex?: number
    }
}
