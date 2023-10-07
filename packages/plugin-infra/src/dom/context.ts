// This file will be virtualized in the future.
// Currently all plugins access the same value, but we can virtualize them in the future.

import type {
    NextIDPlatform,
    PersonaIdentifier,
    PersonaInformation,
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
}
export let allPersonas: __UIContext__['allPersonas']
export let currentPersona: __UIContext__['currentPersona']
export let queryPersonaAvatar: __UIContext__['queryPersonaAvatar']
export let querySocialIdentity: __UIContext__['querySocialIdentity']
export function __setUIContext__(value: __UIContext__) {
    ;({ allPersonas, currentPersona, queryPersonaAvatar, querySocialIdentity } = value)
}
