import { useAsyncRetry } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import type { NonFungibleAssetProvider } from '@masknet/web3-shared-evm'
import { NonFungibleTokenAPI } from '@masknet/web3-providers'
import { EVM_RPC } from '../messages'
import { NetworkPluginID, useChainId } from '@masknet/plugin-infra'

export function useOrders(
    provider: NonFungibleAssetProvider,
    page: number,
    size: number,
    address?: string,
    tokenId?: string,
    side?: NonFungibleTokenAPI.OrderSide,
): AsyncStateRetry<{ data: NonFungibleTokenAPI.AssetOrder[]; hasNextPage: boolean }> {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    return useAsyncRetry(async () => {
        if (!address || !tokenId)
            return {
                data: [],
                hasNextPage: false,
            }
        const orders = await EVM_RPC.getOrders({
            address,
            tokenId,
            side: side ?? NonFungibleTokenAPI.OrderSide.Sell,
            chainId,
            provider,
            page,
            size,
        })

        return {
            data: orders,
            hasNextPage: orders.length === size,
        }
    }, [address, tokenId, side, chainId])
}
