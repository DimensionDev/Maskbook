import { useAsync, useAsyncRetry } from 'react-use'
import { Subscription, useSubscription } from 'use-subscription'
import { first, isEqual } from 'lodash-unified'
import { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '@masknet/shared-base-ui'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { NextIDProof } from '@masknet/web3-providers'
import type { ProfileInformation } from '@masknet/shared-base'
import { activatedSocialNetworkUI, globalUIState } from '../../social-network'
import Services from '../../extension/service'

async function queryPersonaFromDB(identityResolved: IdentityResolved) {
    if (!identityResolved.identifier) return
    return Services.Identity.queryPersonaByProfile(identityResolved.identifier)
}

async function queryPersonasFromNextID(identityResolved: IdentityResolved) {
    if (!identityResolved.identifier) return
    if (!activatedSocialNetworkUI.configuration.nextIDConfig?.platform) return
    return NextIDProof.queryAllExistedBindingsByPlatform(
        activatedSocialNetworkUI.configuration.nextIDConfig?.platform,
        identityResolved.identifier.userId,
    )
}

const defaults = new ValueRef<IdentityResolved>({}, isEqual)

const CurrentIdentitySubscription: Subscription<ProfileInformation | undefined> = {
    getCurrentValue() {
        const all = globalUIState.profiles.value
        const current = (activatedSocialNetworkUI.collecting.identityProvider?.recognized || defaults).value.identifier
        return all.find((i) => i.identifier === current) || first(all)
    },
    subscribe(sub) {
        const a = globalUIState.profiles.addListener(sub)
        const b = activatedSocialNetworkUI.collecting.identityProvider?.recognized.addListener(sub)
        return () => [a(), b?.()]
    },
}

export function useCurrentIdentity() {
    return useSubscription(CurrentIdentitySubscription)
}

export function useLastRecognizedIdentity() {
    return useValueRef(activatedSocialNetworkUI.collecting.identityProvider?.recognized || defaults)
}

export function useCurrentVisitingIdentity() {
    return useValueRef(activatedSocialNetworkUI.collecting.currentVisitingIdentityProvider?.recognized || defaults)
}

export function useCurrentLinkedPersona() {
    const currentIdentity = useSubscription(CurrentIdentitySubscription)
    return useAsync(async () => {
        if (!currentIdentity?.linkedPersona) return
        return Services.Identity.queryPersona(currentIdentity.linkedPersona)
    }, [currentIdentity?.linkedPersona])
}

/**
 * Get a persona bound with the last recognized identity from DB
 */
export function useLastRecognizedPersona() {
    const identity = useLastRecognizedIdentity()
    return useAsyncRetry(async () => queryPersonaFromDB(identity), [identity.identifier?.toText()])
}

/**
 * Get a persona bound with the currently visiting identity from DB
 */
export function useCurrentVisitingPersona() {
    const identity = useCurrentVisitingIdentity()
    return useAsyncRetry(async () => queryPersonaFromDB(identity), [identity.identifier?.toText()])
}

/**
 * Get all personas bound with the last recognized identity from NextID service
 */
export function useLastRecognizedPersonas() {
    const identity = useLastRecognizedIdentity()
    return useAsyncRetry(async () => queryPersonasFromNextID(identity), [identity.identifier?.userId])
}

/**
 * Get all personas bound with the currently visiting identity from NextID service
 */
export function useCurrentVisitingPersonas() {
    const identity = useCurrentVisitingIdentity()
    return useAsyncRetry(async () => queryPersonasFromNextID(identity), [identity.identifier?.userId])
}
