import { useAsyncRetry } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import type { NonFungibleTokenAPI } from '@masknet/web3-providers'
import { NonFungibleAssetProvider, useChainId } from '@masknet/web3-shared-evm'
import { EVM_RPC } from '../messages'

export function useHistory(
    provider: NonFungibleAssetProvider,
    page: number,
    size: number,
    address?: string,
    tokenId?: string,
): AsyncStateRetry<{ data: NonFungibleTokenAPI.History[]; hasNextPage: boolean }> {
    const chainId = useChainId()
    return useAsyncRetry(async () => {
        if (!address || !tokenId)
            return {
                data: [],
                hasNextPage: false,
            }
        const histories = await EVM_RPC.getHistory({ address, tokenId, chainId, provider, page, size })
        return {
            data: histories,
            hasNextPage: histories.length === size,
        }
    }, [address, tokenId])
}
