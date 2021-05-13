import type { ProfileInformation } from '@dimensiondev/maskbook-shared'
import { PersonaContext } from './usePersonaContext'
import { useMemo } from 'react'

export function useProfiles(providers?: ProfileInformation[]) {
    const { definedSocialNetworkUIs } = PersonaContext.useContainer()

    return useMemo<
        {
            networkIdentifier: string
            provider?: ProfileInformation
        }[]
    >(() => {
        if (!providers) return []
        return definedSocialNetworkUIs.map(({ networkIdentifier }) => {
            const provider = providers.find((x) => x.identifier.network === networkIdentifier)

            return {
                networkIdentifier,
                provider,
            }
        })
    }, [definedSocialNetworkUIs, providers])
}
