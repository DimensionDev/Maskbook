import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { NextIDProof } from '@masknet/web3-providers'
import { EMPTY_LIST, type BindingProof, MaskMessages, Sniffings } from '@masknet/shared-base'
import type { UseQueryResult } from '@tanstack/react-query'

export function usePersonaProofs(publicKey?: string): UseQueryResult<BindingProof[]> {
    const result = useQuery<BindingProof[]>({
        queryKey: ['next-id', 'bindings-by-persona', publicKey],
        queryFn: async () => {
            if (Sniffings.is_popup_page) await NextIDProof.clearPersonaQueryCache(publicKey!)
            const binding = await NextIDProof.queryExistedBindingByPersona(publicKey!)
            return binding?.proofs ?? EMPTY_LIST
        },
    })
    const { refetch } = result

    useEffect(() => {
        return MaskMessages.events.ownProofChanged.on(async () => {
            // Clearing the query cache when the proof relation changes
            if (publicKey) {
                await NextIDProof.clearPersonaQueryCache(publicKey)
            }
            refetch()
        })
    }, [publicKey])

    return result
}
