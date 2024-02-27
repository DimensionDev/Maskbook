import { useEffect } from 'react'
import { EMPTY_LIST, MaskMessages, type NextIDPersonaBindings, type NextIDPlatform } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'

/**
 * Get all personas bound with the given identity from NextID service
 */
export function usePersonasFromNextID(
    userId: string,
    platform: NextIDPlatform,
    exact?: boolean,
): UseQueryResult<NextIDPersonaBindings[]> {
    const result = useQuery({
        queryKey: ['next-id', 'personas', userId],
        queryFn: async () => {
            if (!platform || !userId) return EMPTY_LIST
            const bindings = await NextIDProof.queryAllExistedBindingsByPlatform(platform, userId, exact)
            return bindings ? bindings : EMPTY_LIST
        },
    })

    useEffect(() => MaskMessages.events.ownProofChanged.on(() => result.refetch), [result.refetch])
    return result
}
