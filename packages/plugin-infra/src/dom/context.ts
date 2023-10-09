// This file will be virtualized in the future.
// Currently all plugins access the same value, but we can virtualize them in the future.

import type {
    DashboardRoutes,
    NextIDPlatform,
    PersonaIdentifier,
    PersonaInformation,
    PopupRoutes,
    PopupRoutesParamsMap,
    ProfileIdentifier,
    SocialIdentity,
} from '@masknet/shared-base'
import type { Subscription } from 'use-subscription'
import type { IdentityResolved } from '../types.js'

export interface __UIContext__ {
    allPersonas: Subscription<readonly PersonaInformation[]>
    currentPersona: Subscription<PersonaIdentifier | undefined>
    queryPersonaAvatar(
        identifiers: readonly PersonaIdentifier[],
    ): Promise<Map<ProfileIdentifier | PersonaIdentifier, string | undefined>>
    queryPersonaAvatar(identifiers: undefined | PersonaIdentifier): Promise<string | undefined>
    querySocialIdentity: (
        platform: NextIDPlatform,
        identity: IdentityResolved | undefined,
    ) => Promise<SocialIdentity | undefined>
    // DO NOT add <T> to this function, you do not test if it is T right?
    // (e.g. receive a function to check it validate: (x: unknown) => x is T)
    // fetchJSON<T>(validate: (x: unknown) => x is T, input: RequestInfo | URL, init?: RequestInit): Promise<T>
    fetchJSON(input: RequestInfo | URL, init?: RequestInit): Promise<unknown>
    queryPersonaByProfile: (id: ProfileIdentifier) => Promise<PersonaInformation | undefined>
    /** Open Dashboard with a new window */
    openDashboard(route?: DashboardRoutes, search?: string): Promise<void>
    /** Open popup window */
    openPopupWindow<T extends PopupRoutes>(
        route: T,
        params: T extends keyof PopupRoutesParamsMap ? PopupRoutesParamsMap[T] : undefined,
        evenWhenWalletLocked?: boolean,
    ): Promise<void>
}
export let allPersonas: __UIContext__['allPersonas']
export let currentPersona: __UIContext__['currentPersona']
export let queryPersonaAvatar: __UIContext__['queryPersonaAvatar']
export let querySocialIdentity: __UIContext__['querySocialIdentity']
export let fetchJSON: __UIContext__['fetchJSON']
export let queryPersonaByProfile: __UIContext__['queryPersonaByProfile']
export let openDashboard: __UIContext__['openDashboard']
export let openPopupWindow: __UIContext__['openPopupWindow']
export function __setUIContext__(value: __UIContext__) {
    ;({
        allPersonas,
        currentPersona,
        queryPersonaAvatar,
        querySocialIdentity,
        fetchJSON,
        queryPersonaByProfile,
        openDashboard,
        openPopupWindow,
    } = value)
}
