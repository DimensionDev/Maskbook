import { unreachable } from '@dimensiondev/kit'
import { BigNumber } from 'bignumber.js'
import { head } from 'lodash-unified'
import { useAsyncRetry } from 'react-use'
import { PluginCollectibleRPC } from '../messages'
import { CollectibleProvider, CollectibleToken } from '../types'
import { getOrderUnitPrice } from '../utils'

export function useAssetOrder(provider: CollectibleProvider, token?: CollectibleToken) {
    return useAsyncRetry(async () => {
        if (!token) return
        switch (provider) {
            case CollectibleProvider.OPENSEA:
                const openSeaResponse = await PluginCollectibleRPC.getAssetFromSDK(token.contractAddress, token.tokenId)
                const desktopOrder = head(
                    (openSeaResponse.sellOrders ?? []).sort(
                        (a, b) =>
                            new BigNumber(
                                getOrderUnitPrice(
                                    a.currentPrice as string | undefined,
                                    a.paymentTokenContract?.decimals,
                                    a.quantity as unknown as string | undefined,
                                ) ?? 0,
                            ).toNumber() -
                            new BigNumber(
                                getOrderUnitPrice(
                                    b.currentPrice as string | undefined,
                                    b.paymentTokenContract?.decimals,
                                    b.quantity as unknown as string | undefined,
                                ) ?? 0,
                            ).toNumber(),
                    ),
                )
                return desktopOrder
            case CollectibleProvider.RARIBLE:
                return
            default:
                unreachable(provider)
        }
    }, [provider, token])
}
