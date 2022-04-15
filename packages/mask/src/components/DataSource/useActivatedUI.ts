import { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '@masknet/shared-base-ui'
import { EMPTY_LIST, ProfileIdentifier } from '@masknet/shared-base'
import type { Profile } from '../../database'
import { activatedSocialNetworkUI, globalUIState } from '../../social-network'
import { Subscription, useSubscription } from 'use-subscription'
import type { IdentityResolved } from '@masknet/plugin-infra'

export function useFriendsList(): Profile[] {
    const result = [...useValueRef(globalUIState.friends).values()]
    if (result.length === 0) return EMPTY_LIST
    return result
}

const default_ = new ValueRef({ identifier: ProfileIdentifier.unknown })
export function useLastRecognizedIdentity() {
    return useValueRef<IdentityResolved>(activatedSocialNetworkUI.collecting.identityProvider?.recognized || default_)
}
export function useCurrentVisitingIdentity() {
    return useValueRef<IdentityResolved>(
        activatedSocialNetworkUI.collecting.currentVisitingIdentityProvider?.recognized || default_,
    )
}
export function useCurrentIdentity(): Profile | null {
    return useSubscription(CurrentIdentitySubscription)
}

const CurrentIdentitySubscription: Subscription<Profile> = {
    getCurrentValue() {
        const all = globalUIState.profiles.value
        const current = (activatedSocialNetworkUI.collecting.identityProvider?.recognized || default_).value.identifier
        return all.find((i) => i.identifier.toText() === current.toText()) || all[0]
    },
    subscribe(sub) {
        const a = globalUIState.profiles.addListener(sub)
        const b = activatedSocialNetworkUI.collecting.identityProvider?.recognized.addListener(sub)
        return () => [a(), b?.()]
    },
}
