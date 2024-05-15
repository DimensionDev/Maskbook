// This file will be virtualized in the future.
// Currently all plugins access the same value, but we can virtualize them in the future.

import type {
    DashboardRoutes,
    ECKeyIdentifier,
    NextIDPlatform,
    PersonaIdentifier,
    PersonaInformation,
    PopupRoutes,
    PopupRoutesParamsMap,
    ProfileIdentifier,
    SignType,
    SocialIdentity,
} from '@masknet/shared-base'
import type { Subscription } from 'use-subscription'
import type { IdentityResolved } from '../types.js'
import type { LinkedProfileDetails } from '@masknet/public-api'

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
    openDashboard(route: DashboardRoutes, search?: string): Promise<void>
    /** Open popup window */
    openPopupWindow<T extends PopupRoutes>(
        route: T,
        params: T extends keyof PopupRoutesParamsMap ? PopupRoutesParamsMap[T] : undefined,
    ): Promise<void>
    /** Sign a message with persona (w or w/o popups) */
    signWithPersona(type: SignType, message: unknown, identifier?: ECKeyIdentifier, silent?: boolean): Promise<string>
    hasPaymentPassword(): Promise<boolean>
    createPersona: () => void
    setCurrentPersonaIdentifier: ((x?: PersonaIdentifier) => Promise<void>) | undefined
    attachProfile:
        | ((
              source: ProfileIdentifier,
              target: ProfileIdentifier | PersonaIdentifier,
              data: LinkedProfileDetails,
          ) => Promise<void>)
        | undefined
    setPluginMinimalModeEnabled: ((id: string, enabled: boolean) => Promise<void>) | undefined
    hasHostPermission: ((origins: readonly string[]) => Promise<boolean>) | undefined
    requestHostPermission: ((origins: readonly string[]) => Promise<boolean>) | undefined
}
export let allPersonas: __UIContext__['allPersonas']
export let currentPersona: __UIContext__['currentPersona']
export let queryPersonaAvatar: __UIContext__['queryPersonaAvatar']
export let querySocialIdentity: __UIContext__['querySocialIdentity']
export let fetchJSON: __UIContext__['fetchJSON']
export let queryPersonaByProfile: __UIContext__['queryPersonaByProfile']
export let openDashboard: __UIContext__['openDashboard']
export let openPopupWindow: __UIContext__['openPopupWindow']
export let signWithPersona: __UIContext__['signWithPersona']
export let hasPaymentPassword: __UIContext__['hasPaymentPassword']
export let createPersona: __UIContext__['createPersona']
export let setCurrentPersonaIdentifier: __UIContext__['setCurrentPersonaIdentifier']
export let attachProfile: __UIContext__['attachProfile']
export let setPluginMinimalModeEnabled: __UIContext__['setPluginMinimalModeEnabled']
export let hasHostPermission: __UIContext__['hasHostPermission']
export let requestHostPermission: __UIContext__['requestHostPermission']

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
        signWithPersona,
        hasPaymentPassword,
        createPersona,
        setCurrentPersonaIdentifier,
        attachProfile,
        setPluginMinimalModeEnabled,
        hasHostPermission,
        requestHostPermission,
    } = value)
}
