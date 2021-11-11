import { useAsyncRetry } from 'react-use'
import BigNumber from 'bignumber.js'
import { OrderSide } from 'opensea-js/lib/types'
import { unreachable } from '@dimensiondev/kit'
import type { CollectibleToken, NFTOrder, OpenSeaCustomAccount } from '../types'
import { CollectibleProvider } from '../types'
import { PluginCollectibleRPC } from '../messages'
import { getOrderUnitPrice, getOrderUSDPrice } from '../utils'
import { OpenSeaAccountURL } from '../constants'
import { toTokenIdentifier } from '../helpers'

export function useOrders(provider: CollectibleProvider, token?: CollectibleToken, side = OrderSide.Buy, pageNum = 0) {
    return useAsyncRetry<NFTOrder[]>(async () => {
        if (!token) return []
        switch (provider) {
            case CollectibleProvider.OPENSEA:
                const openseaResponse = await PluginCollectibleRPC.getOrders(
                    token.contractAddress,
                    token.tokenId,
                    side,
                    {
                        pageNum,
                        count: 10,
                    },
                )

                return openseaResponse.orders
                    .map((order) => {
                        const unitPrice = new BigNumber(
                            getOrderUnitPrice(
                                order.currentPrice?.toFixed(),
                                order.paymentTokenContract?.decimals,
                                order.quantity.toFixed(),
                            ) ?? 0,
                        ).toNumber()
                        const usdPrice = new BigNumber(
                            getOrderUSDPrice(
                                order.currentPrice?.toFixed(),
                                order.paymentTokenContract?.usdPrice,
                                order.paymentTokenContract?.decimals,
                            ) ?? 0,
                        ).toNumber()
                        return {
                            quantity: new BigNumber(order.quantity).toNumber(),
                            expirationTime: order.side === OrderSide.Sell ? order.listingTime : order.expirationTime,
                            paymentTokenContract: order.paymentTokenContract,
                            hash: order.hash,
                            unitPrice,
                            usdPrice,
                            paymentToken: order.paymentToken,
                            makerAccount: {
                                user: {
                                    username: order.makerAccount?.user?.username,
                                },
                                address: order.makerAccount?.address,
                                profile_img_url: (order.makerAccount as OpenSeaCustomAccount)?.profile_img_url,
                                link: `${OpenSeaAccountURL}${
                                    order.makerAccount?.user?.username ?? order.makerAccount?.address
                                }`,
                            },
                        }
                    })
                    .sort((a, b) => {
                        const current = new BigNumber(a.usdPrice)
                        const next = new BigNumber(b.usdPrice)
                        if (current.isLessThan(next)) {
                            return 1
                        } else if (current.isGreaterThan(next)) {
                            return -1
                        }
                        return 0
                    })
            case CollectibleProvider.RARIBLE:
                return PluginCollectibleRPC.getOrderFromRarible(token.contractAddress, token.tokenId, side)
            default:
                unreachable(provider)
        }
    }, [toTokenIdentifier(token), pageNum, provider])
}
