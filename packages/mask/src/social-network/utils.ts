import { ValueRef } from '@dimensiondev/holoflows-kit'
import { IdentifierMap, ProfileIdentifier, ObservableWeakMap } from '@masknet/shared-base'
import type { SocialNetworkUI } from './types'

export const stateCreator: {
    readonly [key in keyof SocialNetworkUI.AutonomousState]-?: () => SocialNetworkUI.AutonomousState[key]
} = {
    friends: () => new ValueRef(new IdentifierMap(new Map(), ProfileIdentifier)),
    profiles: () => new ValueRef([]),
}
export const creator = {
    EmptyIdentityResolveProviderState:
        (): SocialNetworkUI.CollectingCapabilities.IdentityResolveProvider['recognized'] =>
            new ValueRef({ identifier: ProfileIdentifier.unknown }),
    EmptyPostProviderState: (): SocialNetworkUI.CollectingCapabilities.PostsProvider['posts'] =>
        new ObservableWeakMap(),
}
