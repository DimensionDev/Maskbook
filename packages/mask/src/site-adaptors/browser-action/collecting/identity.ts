import type { SiteAdaptorUI } from '@masknet/types'
import { creator } from '../../../site-adaptor-infra/index.js'

export const IdentityProviderDefault: SiteAdaptorUI.CollectingCapabilities.IdentityResolveProvider = {
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(signal) {},
}

export const CurrentVisitingIdentityProviderDefault: SiteAdaptorUI.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(signal) {},
}
