import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { BindingProof, EMPTY_LIST, MaskEvents } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useEffect } from 'react'
import { useAsyncFn, useEffectOnce } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'

export function usePersonaProofs(publicKey?: string, message?: WebExtensionMessage<MaskEvents>) {
    const [state, fn] = useAsyncFn(
        async (enableCache = true) => {
            try {
                if (!publicKey) return EMPTY_LIST

                const binding = await NextIDProof.queryExistedBindingByPersona(publicKey, enableCache)
                return binding?.proofs ?? EMPTY_LIST
            } catch {
                return EMPTY_LIST
            }
        },
        [publicKey],
    )

    useEffectOnce(() => {
        fn(true)
    })

    const retry = () => {
        if (state.loading) return
        fn(false)
    }

    useEffect(() => message?.events.ownProofChanged.on(retry), [retry])

    return {
        value: state.value ?? EMPTY_LIST,
        loading: state.loading,
        retry,
    } as AsyncStateRetry<BindingProof[]>
}
