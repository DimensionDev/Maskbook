import type { ProfileInformation } from '@dimensiondev/maskbook-shared'
import { PersonaContext } from './usePersonaContext'
import { useMemo } from 'react'
import { ProfileIdentifier } from '@dimensiondev/maskbook-shared'

export function useProfiles(providers?: ProfileInformation[]) {
    const { definedSocialNetworkUIs } = PersonaContext.useContainer()

    return useMemo<ProfileInformation[]>(() => {
        if (!providers) return []
        return definedSocialNetworkUIs.map(
            ({ networkIdentifier }) =>
                providers.find((x) => x.identifier.network === networkIdentifier) ?? {
                    identifier: new ProfileIdentifier(networkIdentifier, ''),
                },
        )
    }, [definedSocialNetworkUIs, providers])
}
