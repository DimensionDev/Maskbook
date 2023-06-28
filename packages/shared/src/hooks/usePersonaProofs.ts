import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { NextIDProof } from '@masknet/web3-providers'
import { EMPTY_LIST, type BindingProof, type MaskEvents } from '@masknet/shared-base'

export function usePersonaProofs(publicKey?: string, message?: WebExtensionMessage<MaskEvents>) {
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
            message?.events.ownProofChanged.on(() => {
                refetch()
            }),
        [publicKey],
    )

    return result
}
