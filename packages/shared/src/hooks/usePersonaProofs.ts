import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { EMPTY_LIST, type BindingProof, type MaskEvents } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'

export function usePersonaProofs(publicKey?: string, message?: WebExtensionMessage<MaskEvents>) {
    const queryKey = useMemo(() => ['next-id', 'bindings-by-persona', publicKey], [publicKey])
    const result = useQuery<BindingProof[], Error>({
        queryKey,
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
        [queryKey],
    )

    return result
}
