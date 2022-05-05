import { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '@masknet/shared-base-ui'
import type { PersonaIdentifier, ProfileIdentifier, ProfileInformation } from '@masknet/shared-base'
import { activatedSocialNetworkUI, globalUIState } from '../../social-network'
import { Subscription, useSubscription } from 'use-subscription'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { isEqual } from 'lodash-unified'

const default_ = new ValueRef<IdentityResolved>({}, isEqual)
export function useLastRecognizedIdentity() {
    return useValueRef<IdentityResolved>(activatedSocialNetworkUI.collecting.identityProvider?.recognized || default_)
}
export function useCurrentVisitingIdentity() {
    return useValueRef<IdentityResolved>(
        activatedSocialNetworkUI.collecting.currentVisitingIdentityProvider?.recognized || default_,
    )
}
export function useCurrentIdentity(): {
    identifier: ProfileIdentifier
    linkedPersona?: { nickname?: string; identifier: PersonaIdentifier; fingerprint?: string }
    fingerprint?: string
} | null {
    return useSubscription(CurrentIdentitySubscription)
}

const CurrentIdentitySubscription: Subscription<ProfileInformation> = {
    getCurrentValue() {
        const all = globalUIState.profiles.value
        const current = (activatedSocialNetworkUI.collecting.identityProvider?.recognized || default_).value.identifier
        return all.find((i) => i.identifier === current) || all[0]
    },
    subscribe(sub) {
        const a = globalUIState.profiles.addListener(sub)
        const b = activatedSocialNetworkUI.collecting.identityProvider?.recognized.addListener(sub)
        return () => [a(), b?.()]
    },
}
