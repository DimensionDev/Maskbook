// This file will be virtualized in the future.
// Currently all plugins access the same value, but we can virtualize them in the future.

import type { Subscription } from 'use-subscription'
import type { IdentityResolved } from '../types.js'
import { __setUIContext__, type __UIContext__ } from '../dom/context.js'
import type { NextIDPlatform, PersonaIdentifier } from '@masknet/shared-base'

export * from '../dom/context.js'
export interface __SiteAdaptorContext__ extends __UIContext__ {
    lastRecognizedProfile: Subscription<IdentityResolved | undefined>
    currentVisitingProfile: Subscription<IdentityResolved | undefined>
    currentNextIDPlatform: NextIDPlatform | undefined
    currentPersonaIdentifier: Subscription<PersonaIdentifier | undefined>
}
export let lastRecognizedProfile: __SiteAdaptorContext__['lastRecognizedProfile']
export let currentVisitingProfile: __SiteAdaptorContext__['currentVisitingProfile']
export let currentNextIDPlatform: NextIDPlatform | undefined
export let currentPersonaIdentifier: __SiteAdaptorContext__['currentPersonaIdentifier']
export function __setSiteAdaptorContext__(value: __SiteAdaptorContext__) {
    __setUIContext__(value)
    ;({ lastRecognizedProfile, currentVisitingProfile, currentNextIDPlatform } = value)
}
