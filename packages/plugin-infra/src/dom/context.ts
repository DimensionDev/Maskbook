// This file will be virtualized in the future.
// Currently all plugins access the same value, but we can virtualize them in the future.

import type { PersonaIdentifier, PersonaInformation, ProfileIdentifier } from '@masknet/shared-base'
import type { Subscription } from 'use-subscription'

export interface __UIContext__ {
    allPersonas: Subscription<readonly PersonaInformation[]>
    currentPersona: Subscription<PersonaIdentifier | undefined>
    queryPersonaAvatar(
        identifiers: readonly PersonaIdentifier[],
    ): Promise<Map<ProfileIdentifier | PersonaIdentifier, string | undefined>>
    queryPersonaAvatar(identifiers: undefined | PersonaIdentifier): Promise<string | undefined>
}
export let allPersonas: __UIContext__['allPersonas']
export let currentPersona: __UIContext__['currentPersona']
export let queryPersonaAvatar: __UIContext__['queryPersonaAvatar']
export function __setUIContext__(value: __UIContext__) {
    ;({ allPersonas, currentPersona, queryPersonaAvatar } = value)
}
