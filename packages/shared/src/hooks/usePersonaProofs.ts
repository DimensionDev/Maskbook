import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { NextIDProof } from '@masknet/web3-providers'
import { EMPTY_LIST, type BindingProof, MaskMessages } from '@masknet/shared-base'

export function usePersonaProofs(publicKey?: string) {
    const result = useQuery<BindingProof[], Error>({
        queryKey: ['next-id', 'bindings-by-persona', publicKey],
        enabled: !!publicKey,
        queryFn: async () => {
            const binding = await NextIDProof.queryExistedBindingByPersona(publicKey!)
            return binding?.proofs ?? EMPTY_LIST
        },
    })
    const { refetch } = result

    useEffect(
        () =>
            MaskMessages.events.ownProofChanged.on(() => {
                refetch()
            }),
        [publicKey],
    )

    return result
}
