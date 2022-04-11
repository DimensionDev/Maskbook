import { useMemo } from 'react'
import { activatedSocialNetworkUI } from '../../social-network'
import { useMyPersonas } from './useMyPersonas'

export function useMyProfiles() {
    const myPersonas = useMyPersonas()
    return useMemo(
        () =>
            myPersonas.map((persona) =>
                [...persona.linkedProfiles].filter(
                    ([key, value]) => key.network === activatedSocialNetworkUI.networkIdentifier,
                ),
            ),
        [myPersonas],
    )
}
