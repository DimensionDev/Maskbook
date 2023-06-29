import type { SocialNetworkUI as Next } from '@masknet/types'
import { creator } from '../../../social-network/index.js'

export const IdentityProviderDefault: Next.CollectingCapabilities.IdentityResolveProvider = {
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(signal) {},
}

export const CurrentVisitingIdentityProviderDefault: Next.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(signal) {},
}
