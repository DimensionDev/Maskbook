import { useAsync } from 'react-use'
import { Subscription, useSubscription } from 'use-subscription'
import { isEqual } from 'lodash-unified'
import { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '@masknet/shared-base-ui'
import type { IdentityResolved } from '@masknet/plugin-infra'
import type { PersonaIdentifier, ProfileIdentifier, ProfileInformation } from '@masknet/shared-base'
import { activatedSocialNetworkUI, globalUIState } from '../../social-network'
import Services from '../../extension/service'

const defaults = new ValueRef<IdentityResolved>({}, isEqual)

const CurrentIdentitySubscription: Subscription<ProfileInformation> = {
    getCurrentValue() {
        const all = globalUIState.profiles.value
        const current = (activatedSocialNetworkUI.collecting.identityProvider?.recognized || defaults).value.identifier
        return all.find((i) => i.identifier === current) || all[0]
    },
    subscribe(sub) {
        const a = globalUIState.profiles.addListener(sub)
        const b = activatedSocialNetworkUI.collecting.identityProvider?.recognized.addListener(sub)
        return () => [a(), b?.()]
    },
}

export function useLastRecognizedIdentity() {
    return useValueRef<IdentityResolved>(activatedSocialNetworkUI.collecting.identityProvider?.recognized || defaults)
}

export function useCurrentVisitingIdentity() {
    return useValueRef<IdentityResolved>(
        activatedSocialNetworkUI.collecting.currentVisitingIdentityProvider?.recognized || defaults,
    )
}

export function useCurrentIdentity(): {
    identifier: ProfileIdentifier
    linkedPersona?: PersonaIdentifier
} | null {
    return useSubscription(CurrentIdentitySubscription)
}

export function useCurrentLinkedPersona() {
    const currentIdentity = useSubscription(CurrentIdentitySubscription)
    return useAsync(async () => {
        if (!currentIdentity?.linkedPersona) return
        return Services.Identity.queryPersona(currentIdentity.linkedPersona)
    }, [currentIdentity?.linkedPersona])
}
