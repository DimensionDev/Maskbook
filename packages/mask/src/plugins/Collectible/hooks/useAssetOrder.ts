import { unreachable } from '@dimensiondev/kit'
import { getOrderUnitPrice } from '@masknet/web3-providers'
import { ZERO } from '@masknet/web3-shared-base'
import { NonFungibleAssetProvider } from '@masknet/web3-shared-evm'
import { head } from 'lodash-unified'
import type { Order } from 'opensea-js/lib/types'
import { useAsyncRetry } from 'react-use'
import { PluginCollectibleRPC } from '../messages'
import type { AssetOrder, CollectibleToken } from '../types'

export function useAssetOrder(provider: NonFungibleAssetProvider, token?: CollectibleToken) {
    return useAsyncRetry(async () => {
        if (!token?.contractAddress || !token?.tokenId) return
        switch (provider) {
            case NonFungibleAssetProvider.OPENSEA:
                const openSeaResponse = await PluginCollectibleRPC.getAssetFromSDK(token.contractAddress, token.tokenId)
                const getPrice = (order: Order | AssetOrder) => {
                    const _order = order as AssetOrder
                    return (
                        getOrderUnitPrice(
                            _order.currentPrice,
                            _order.paymentTokenContract?.decimals,
                            _order.quantity,
                        ) ?? ZERO
                    )
                }

                const sellOrders = openSeaResponse.sellOrders ?? []
                const desktopOrder = head(sellOrders.sort((a, b) => getPrice(a).toNumber() - getPrice(b).toNumber()))
                return desktopOrder
            case NonFungibleAssetProvider.RARIBLE:
                return
            case NonFungibleAssetProvider.NFTSCAN:
                return
            case NonFungibleAssetProvider.ZORA:
                return
            case NonFungibleAssetProvider.LOOKSRARE:
                return
            default:
                unreachable(provider)
        }
    }, [provider, token?.contractAddress, token?.tokenId])
}
