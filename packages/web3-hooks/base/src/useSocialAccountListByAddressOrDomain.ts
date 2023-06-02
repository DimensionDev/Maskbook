import { Web3Bio, NextIDProof } from '@masknet/web3-providers'
import { useAsync } from 'react-use'
import { type BindingProof, EMPTY_LIST } from '@masknet/shared-base'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { attemptUntil } from '@masknet/web3-shared-base'

export function useSocialAccountListByAddressOrDomain(
    address: string,
    domain?: string,
    defaultBindingProofs?: BindingProof[],
): AsyncState<BindingProof[]> {
    return useAsync(async () => {
        if (defaultBindingProofs?.length) return defaultBindingProofs
        if (!address && !domain) return EMPTY_LIST

        return attemptUntil(
            [
                async () => (domain ? await NextIDProof.queryProfilesByDomain(domain) : EMPTY_LIST),
                async () => (address ? await NextIDProof.queryProfilesByAddress(address) : EMPTY_LIST),
                async () => (address ? await Web3Bio.queryProfilesByAddress(address) : EMPTY_LIST),
            ],
            undefined,
            (result) => !result?.length,
        )
    }, [address, domain, JSON.stringify(defaultBindingProofs)])
}
