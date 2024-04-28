import type { IdentityResolved } from '@masknet/plugin-infra'
import { MaskMessages, ValueRef, type ProfileInformation } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { NextIDProof } from '@masknet/web3-providers'
import { FontSize, ThemeColor, ThemeMode, type ThemeSettings } from '@masknet/web3-shared-base'
import { useQuery } from '@tanstack/react-query'
import { first, isEqual } from 'lodash-es'
import { useEffect, useMemo } from 'react'
import { useSubscription, type Subscription } from 'use-subscription'
import Services from '#services'
import { activatedSiteAdaptorUI, activatedSiteAdaptor_state } from '../../site-adaptor-infra/index.js'

async function queryPersonaFromDB(identityResolved: IdentityResolved) {
    if (!identityResolved.identifier) return
    return Services.Identity.queryPersonaByProfile(identityResolved.identifier)
}

async function queryPersonasFromNextID(identityResolved: IdentityResolved) {
    if (!identityResolved.identifier) return
    if (!activatedSiteAdaptorUI?.configuration.nextIDConfig?.platform) return
    return NextIDProof.queryAllExistedBindingsByPlatform(
        activatedSiteAdaptorUI.configuration.nextIDConfig.platform,
        identityResolved.identifier.userId,
    )
}

const CurrentIdentitySubscription: Subscription<ProfileInformation | undefined> = {
    getCurrentValue() {
        const all = activatedSiteAdaptor_state!.profiles.value
        const current = (activatedSiteAdaptorUI!.collecting.identityProvider?.recognized || defaultIdentityResolved)
            .value.identifier
        return all.find((i) => i.identifier === current) || first(all)
    },
    subscribe(sub) {
        const a = activatedSiteAdaptor_state!.profiles.addListener(sub)
        const b = activatedSiteAdaptorUI!.collecting.identityProvider?.recognized.addListener(sub)
        return () => [a(), b?.()]
    },
}

const defaults = {
    mode: ThemeMode.Light,
    size: FontSize.Normal,
    color: ThemeColor.Blue,
}
const defaultIdentityResolved = new ValueRef<IdentityResolved>({}, isEqual)
const defaultThemeSettings = new ValueRef<Partial<ThemeSettings>>({}, isEqual)

export function useCurrentIdentity() {
    return useSubscription(CurrentIdentitySubscription)
}

export function useLastRecognizedIdentity() {
    return useValueRef(activatedSiteAdaptorUI!.collecting.identityProvider?.recognized || defaultIdentityResolved)
}

export function useCurrentVisitingIdentity() {
    return useValueRef(
        activatedSiteAdaptorUI!.collecting.currentVisitingIdentityProvider?.recognized || defaultIdentityResolved,
    )
}

/**
 * Get the social identity of the given identity
 */
export function useSocialIdentity(identity: IdentityResolved | null | undefined) {
    const result = useQuery({
        enabled: !!identity,
        queryKey: ['social-identity', identity],
        queryFn: async () => {
            try {
                if (!identity) return null

                const persona = await queryPersonaFromDB(identity)
                if (!persona) return identity

                const bindings = await queryPersonasFromNextID(identity)
                if (!bindings) return identity

                const personaBindings =
                    bindings?.filter((x) => x.persona === persona?.identifier.publicKeyAsHex.toLowerCase()) ?? []
                return {
                    ...identity,
                    publicKey: persona?.identifier.publicKeyAsHex,
                    hasBinding: personaBindings.length > 0,
                    binding: first(personaBindings),
                }
            } catch {
                return identity
            }
        },
    })

    useEffect(() => MaskMessages.events.ownProofChanged.on(() => result.refetch()), [result.refetch])

    return result
}

export function useSocialIdentityByUserId(userId?: string) {
    const { data: identity } = useQuery({
        queryKey: ['social-identity', 'by-id', userId],
        enabled: !!userId,
        queryFn: async () => {
            return activatedSiteAdaptorUI!.utils.getUserIdentity?.(userId!)
        },
        networkMode: 'always',
    })
    return useSocialIdentity(identity)
}

export function useThemeSettings() {
    const themeSettings = useValueRef(
        (activatedSiteAdaptorUI?.collecting.themeSettingsProvider?.recognized ||
            defaultThemeSettings) as ValueRef<ThemeSettings>,
    )
    return useMemo<ThemeSettings>(
        () => ({
            ...defaults,
            ...activatedSiteAdaptorUI?.configuration.themeSettings,
            ...themeSettings,
        }),
        [activatedSiteAdaptorUI?.configuration.themeSettings, themeSettings],
    )
}
