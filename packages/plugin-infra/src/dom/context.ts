// This file will be virtualized in the future.
// Currently all plugins access the same value, but we can virtualize them in the future.

import type { PersonaInformation } from '@masknet/shared-base'
import type { Subscription } from 'use-subscription'

export interface __UIContext__ {
    allPersonas: Subscription<readonly PersonaInformation[]>
}
export let allPersonas: __UIContext__['allPersonas']
export function __setUIContext__(value: __UIContext__) {
    allPersonas = value.allPersonas
}
