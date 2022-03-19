import { useMemo } from 'react'
import { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '@masknet/shared-base-ui'
import { ProfileIdentifier } from '@masknet/shared-base'
import type { Profile } from '../../database'
import type { SocialNetworkUI } from '../../social-network'
import { activatedSocialNetworkUI, globalUIState } from '../../social-network'
import { Subscription, useSubscription } from 'use-subscription'

export function useFriendsList() {
    const ref = useValueRef(globalUIState.friends)
    return useMemo(() => [...ref.values()], [ref])
}

const default_ = new ValueRef({ identifier: ProfileIdentifier.unknown })
export function useLastRecognizedIdentity() {
    return useValueRef<SocialNetworkUI.CollectingCapabilities.IdentityResolved>(
        activatedSocialNetworkUI.collecting.identityProvider?.recognized || default_,
    )
}
export function useCurrentVisitingIdentity() {
    return useValueRef<SocialNetworkUI.CollectingCapabilities.IdentityResolved>(
        activatedSocialNetworkUI.collecting.currentVisitingIdentityProvider?.recognized || default_,
    )
}
export function useMyIdentities() {
    return useValueRef(globalUIState.profiles)
}
export function useCurrentIdentity(): Profile | null {
    return useSubscription(CurrentIdentitySubscription)
}

export const CurrentIdentitySubscription: Subscription<Profile> = {
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
