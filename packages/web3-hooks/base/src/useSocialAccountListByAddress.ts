import { Web3Bio, NextIDProof } from '@masknet/web3-providers'
import { useAsync } from 'react-use'
import { type BindingProof, EMPTY_LIST } from '@masknet/shared-base'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { attemptUntil } from '@masknet/web3-shared-base'

export function useSocialAccountListByAddress(
    address: string,
    defaultBindingProofs?: BindingProof[],
): AsyncState<BindingProof[]> {
    return useAsync(async () => {
        if (defaultBindingProofs?.length) return defaultBindingProofs
        if (!address) return EMPTY_LIST

        return attemptUntil(
            [NextIDProof, Web3Bio].map((x) => {
                return async () => (address ? x.queryProfilesByAddress(address) : EMPTY_LIST)
            }),
            undefined,
            (result) => !result?.length,
        )
    }, [address, JSON.stringify(defaultBindingProofs)])
}
