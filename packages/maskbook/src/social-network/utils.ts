import { ValueRef } from '@dimensiondev/holoflows-kit'
import { IdentifierMap, ProfileIdentifier, ObservableWeakMap } from '@masknet/shared'
import type { SocialNetworkUI } from './types'

// By this pattern, I hope we can enforce all providers to use this pattern to init.
// const friendsRef = stateCreator.friendsRef()
// return { friendsRef }

// Therefore they may aware they have the ability to fill in the ref.
// If I design it like this:
// const state = stateCreator()
// return state
// People might not aware they need to fill the new state.

export const stateCreator: {
    readonly [key in keyof SocialNetworkUI.AutonomousState]-?: () => SocialNetworkUI.AutonomousState[key]
} = {
    friends: () => new ValueRef(new IdentifierMap(new Map(), ProfileIdentifier)),
    profiles: () => new ValueRef([]),
}
export function managedStateCreator(): SocialNetworkUI.ManagedState {
    return {}
}
export const creator = {
    IdentityResolveProviderLastRecognized:
        (): SocialNetworkUI.CollectingCapabilities.IdentityResolveProvider['lastRecognized'] =>
            new ValueRef({ identifier: ProfileIdentifier.unknown }),
    PostProviderStore: (): SocialNetworkUI.CollectingCapabilities.PostsProvider['posts'] => new ObservableWeakMap(),
}
