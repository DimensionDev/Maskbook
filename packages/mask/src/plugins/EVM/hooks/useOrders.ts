import type { AssetOrder } from '@masknet/web3-providers'
import { OrderSide } from '@masknet/web3-providers'
import { NonFungibleAssetProvider, useChainId } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { EVM_RPC } from '../messages'

export function useOrders(
    provider: NonFungibleAssetProvider,
    page: number,
    size: number,
    address?: string,
    tokenId?: string,
    side?: OrderSide,
): AsyncStateRetry<{ data: AssetOrder[]; hasNextPage: boolean }> {
    const chainId = useChainId()
    return useAsyncRetry(async () => {
        if (!address || !tokenId)
            return {
                data: [],
                hasNextPage: false,
            }
        const orders = await EVM_RPC.getOrders(address, tokenId, side ?? OrderSide.Sell, chainId, provider, page, size)
        return {
            data: orders,
            hasNextPage: orders.length === size,
        }
    }, [address, tokenId, side, chainId])
}
