import { unreachable } from '@dimensiondev/kit'
import { getOrderUnitPrice } from '@masknet/web3-providers'
import { NonFungibleAssetProvider } from '@masknet/web3-shared-evm'
import { BigNumber } from 'bignumber.js'
import { head } from 'lodash-unified'
import { useAsyncRetry } from 'react-use'
import { PluginCollectibleRPC } from '../messages'
import type { CollectibleToken } from '../types'

export function useAssetOrder(provider: NonFungibleAssetProvider, token?: CollectibleToken) {
    return useAsyncRetry(async () => {
        if (!token) return
        switch (provider) {
            case NonFungibleAssetProvider.OPENSEA:
                const openSeaResponse = await PluginCollectibleRPC.getAssetFromSDK(token.contractAddress, token.tokenId)

                const desktopOrder = head(
                    (openSeaResponse.sellOrders ?? []).sort(
                        (a, b) =>
                            new BigNumber(
                                getOrderUnitPrice(
                                    a.currentPrice?.toFixed(),
                                    a.paymentTokenContract?.decimals ?? 0,
                                    a.quantity.toFixed(),
                                ) ?? 0,
                            ).toNumber() -
                            new BigNumber(
                                getOrderUnitPrice(
                                    b.currentPrice?.toFixed(),
                                    b.paymentTokenContract?.decimals,
                                    b.quantity.toFixed(),
                                ) ?? 0,
                            ).toNumber(),
                    ),
                )

                return desktopOrder
            case NonFungibleAssetProvider.RARIBLE:
                return
            case NonFungibleAssetProvider.NFTSCAN:
                return
            default:
                unreachable(provider)
        }
    }, [provider, token])
}
