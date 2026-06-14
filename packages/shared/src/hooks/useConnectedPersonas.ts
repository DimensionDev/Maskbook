import { useCallback, useEffect, useMemo } from 'react'
import { MaskMessages } from '@masknet/shared-base'
import { useAllPersonas } from '@masknet/plugin-infra/content-script'
import { queryPersonaAvatar } from '@masknet/plugin-infra/dom/context'
import { useQuery } from '@tanstack/react-query'

export function useConnectedPersonas() {
    const allPersonas = useAllPersonas()
    const allPersonaIdentifiers = allPersonas.map((x) => x.identifier)
    const {
        data: avatars,
        isPending: avatarsIsPending,
        error: avatarsError,
        refetch: refetchAvatars,
    } = useQuery({
        queryKey: ['connected-persona', 'avatars', allPersonaIdentifiers],
        queryFn: () => {
            return queryPersonaAvatar?.(allPersonaIdentifiers)
        },
    })

    const personas = useMemo(() => {
        return allPersonas.map((x) => {
            return {
                persona: x,
                avatar: avatars?.get(x.identifier),
            }
        })
    }, [allPersonas, avatars])

    const refetch = useCallback(() => {
        refetchAvatars()
    }, [refetchAvatars])

    useEffect(() => MaskMessages.events.ownPersonaChanged.on(() => refetch()), [refetch])

    return {
        personas,
        isPending: avatarsIsPending,
        error: avatarsError,
        refetch,
    }
}
