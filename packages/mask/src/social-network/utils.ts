import { isEqual } from 'lodash-unified'
import type { SocialNetworkUI } from '@masknet/social-network-infra'
import { ValueRef } from '@dimensiondev/holoflows-kit'
import { ObservableWeakMap } from '@masknet/shared-base'

export const stateCreator: {
    readonly [key in keyof SocialNetworkUI.AutonomousState]-?: () => SocialNetworkUI.AutonomousState[key]
} = {
    profiles: () => new ValueRef([]),
}
export const creator = {
    EmptyIdentityResolveProviderState:
        (): SocialNetworkUI.CollectingCapabilities.IdentityResolveProvider['recognized'] => new ValueRef({}, isEqual),
    EmptyPostProviderState: (): SocialNetworkUI.CollectingCapabilities.PostsProvider['posts'] =>
        new ObservableWeakMap(),
}
