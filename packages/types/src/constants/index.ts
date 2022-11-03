import { isEqual } from 'lodash-unified'
import { ValueRef } from '@dimensiondev/holoflows-kit'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { ObservableWeakMap } from '@masknet/shared-base'
import type { SocialNetworkUI } from '../types.js'

export const IDENTITY_RESOLVED_DEFAULTS = new ValueRef<IdentityResolved>({}, isEqual)

export const STATE_CREATOR: {
    readonly [key in keyof SocialNetworkUI.AutonomousState]-?: () => SocialNetworkUI.AutonomousState[key]
} = {
    profiles: () => new ValueRef([]),
}

export const CREATOR = {
    EmptyIdentityResolveProviderState:
        (): SocialNetworkUI.CollectingCapabilities.IdentityResolveProvider['recognized'] => new ValueRef({}, isEqual),
    EmptyPostProviderState: (): SocialNetworkUI.CollectingCapabilities.PostsProvider['posts'] =>
        new ObservableWeakMap(),
}
