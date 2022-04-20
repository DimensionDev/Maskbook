import { ValueRef } from '@dimensiondev/holoflows-kit'
import { ProfileIdentifier, ObservableWeakMap } from '@masknet/shared-base'
import type { SocialNetworkUI } from './types'

export const stateCreator: {
    readonly [key in keyof SocialNetworkUI.AutonomousState]-?: () => SocialNetworkUI.AutonomousState[key]
} = {
    profiles: () => new ValueRef([]),
}
export const creator = {
    EmptyIdentityResolveProviderState:
        (): SocialNetworkUI.CollectingCapabilities.IdentityResolveProvider['recognized'] =>
            new ValueRef({ identifier: ProfileIdentifier.unknown }),
    EmptyPostProviderState: (): SocialNetworkUI.CollectingCapabilities.PostsProvider['posts'] =>
        new ObservableWeakMap(),
}
