import type { SocialNetworkUI } from '../../../social-network'
import { IdentityProviderMinds } from './identity'

export function profilesCollectorMinds(signal: AbortSignal) {
    registerUserCollectorInner(IdentityProviderMinds.lastRecognized, signal)
}

function registerUserCollectorInner(
    ref: SocialNetworkUI.CollectingCapabilities.IdentityResolveProvider['lastRecognized'],
    signal: AbortSignal,
) {
    // TODO
}
