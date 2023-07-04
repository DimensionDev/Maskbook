import type { ProfileIdentifier } from '@masknet/shared-base'

export declare namespace SiteAdaptor {
    export interface DeclarativePermissions {
        origins: readonly string[]
    }
    export interface Definition {
        name: string
        networkIdentifier: string
        // Note: if declarativePermissions is no longer sufficient, use "false" to indicate it need a load().
        declarativePermissions: DeclarativePermissions
        homepage: undefined | string
        getProfilePage: null | ((profile: ProfileIdentifier) => URL | null)
        getShareLinkURL: null | ((text: string) => URL)
        notReadyForProduction?: boolean
        /** Whether this provider need to connect persona */
        isSocialNetwork?: boolean
        sortIndex?: number
    }
}
