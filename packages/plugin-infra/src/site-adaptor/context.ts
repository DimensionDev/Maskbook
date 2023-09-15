// This file will be virtualized in the future.
// Currently all plugins access the same value, but we can virtualize them in the future.

import type { Subscription } from 'use-subscription'
import type { IdentityResolved } from '../types.js'

export interface __SiteAdaptorContext__ {
    lastRecognizedProfile: Subscription<IdentityResolved | undefined>
}
export let lastRecognizedProfile: __SiteAdaptorContext__['lastRecognizedProfile']
export function __setSiteAdaptorContext__(value: __SiteAdaptorContext__) {
    lastRecognizedProfile = value.lastRecognizedProfile
}
