// This file will be virtualized in the future.
// Currently all plugins access the same value, but we can virtualize them in the future.

import type { Subscription } from 'use-subscription'
import type { IdentityResolved } from '../types.js'
import { __setUIContext__, type __UIContext__ } from '../dom/context.js'

export * from '../dom/context.js'
export interface __SiteAdaptorContext__ extends __UIContext__ {
    lastRecognizedProfile: Subscription<IdentityResolved | undefined>
    currentVisitingProfile: Subscription<IdentityResolved | undefined>
}
export let lastRecognizedProfile: __SiteAdaptorContext__['lastRecognizedProfile']
export let currentVisitingProfile: __SiteAdaptorContext__['currentVisitingProfile']
export function __setSiteAdaptorContext__(value: __SiteAdaptorContext__) {
    __setUIContext__(value)
    lastRecognizedProfile = value.lastRecognizedProfile
    currentVisitingProfile = value.currentVisitingProfile
}
