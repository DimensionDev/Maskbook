import { useCallback, useEffect, useMemo } from 'react'
import { EMPTY_LIST, MaskMessages, NextIDPlatform } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useAllPersonas } from '@masknet/plugin-infra/content-script'
import { queryPersonaAvatar } from '@masknet/plugin-infra/dom/context'
import { useQuery } from '@tanstack/react-query'

export function useConnectedPersonas() {
    const allPersonas = useAllPersonas()
    const allPersonaPublicKeys = allPersonas.map((x) => x.identifier.publicKeyAsHex)
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
    const {
        data: bindings = EMPTY_LIST,
        isPending: bindingsIsPending,
        error: bindingsError,
        refetch: refetchBindings,
    } = useQuery({
        queryKey: ['connected-persona', 'bindings', allPersonaPublicKeys],
        queryFn: () => {
            return NextIDProof.queryAllExistedBindingsByPlatform(NextIDPlatform.NextID, allPersonaPublicKeys.join(','))
        },
    })

    const personas = useMemo(() => {
        return allPersonas.map((x) => {
            const pubkey = x.identifier.publicKeyAsHex.toLowerCase()
            return {
                persona: x,
                proof:
                    bindings.find((p) => p.persona.toLowerCase() === pubkey)?.proofs.filter((x) => x.is_valid) ??
                    EMPTY_LIST,
                avatar: avatars?.get(x.identifier),
            }
        })
    }, [allPersonas, bindings, avatars])

    const refetch = useCallback(() => {
        refetchBindings()
        refetchAvatars()
    }, [refetchBindings, refetchAvatars])

    useEffect(() => MaskMessages.events.ownProofChanged.on(() => refetch()), [refetch])
    useEffect(() => MaskMessages.events.ownPersonaChanged.on(() => refetch()), [refetch])

    return {
        personas,
        isPending: avatarsIsPending || bindingsIsPending,
        error: avatarsError || bindingsError,
        refetch,
    }
}
