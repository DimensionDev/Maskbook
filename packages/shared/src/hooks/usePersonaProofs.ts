import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { type BindingProof, EMPTY_LIST, type MaskEvents } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo } from 'react'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'

export function usePersonaProofs(
    publicKey?: string,
    message?: WebExtensionMessage<MaskEvents>,
): AsyncStateRetry<BindingProof[]> {
    const queryKey = useMemo(() => ['next-id', 'bindings-by-persona', publicKey], [publicKey])
    // TODO use isInitialLoading
    const { data, refetch, isFetching, isError, error } = useQuery<BindingProof[], Error>({
        queryKey,
        enabled: !!publicKey,
        queryFn: async () => {
            const binding = await NextIDProof.queryExistedBindingByPersona(publicKey!)
            return binding?.proofs ?? EMPTY_LIST
        },
    })

    const retry = useCallback(() => {
        refetch()
    }, [])

    useEffect(
        () =>
            message?.events.ownProofChanged.on(() => {
                refetch()
            }),
        [queryKey],
    )

    if (isFetching) {
        return {
            loading: true,
            value: data ?? EMPTY_LIST,
            retry,
        }
    }

    if (isError) {
        return {
            loading: false,
            error,
            retry,
        }
    }

    return {
        value: data ?? EMPTY_LIST,
        loading: isFetching,
        retry,
    }
}
