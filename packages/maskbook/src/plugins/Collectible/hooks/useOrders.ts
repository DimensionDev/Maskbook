import { useAsyncRetry } from 'react-use'
import BigNumber from 'bignumber.js'
import { OrderSide } from 'opensea-js/lib/types'
import { unreachable } from '@dimensiondev/kit'
import type { CollectibleToken, NFTOrder, OpenSeaCustomAccount } from '../types'
import { CollectibleProvider } from '../types'
import { PluginCollectibleRPC } from '../messages'
import { getOrderUnitPrice } from '../utils'
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
                return openseaResponse.orders.map((order) => {
                    const unitPrice = new BigNumber(getOrderUnitPrice(order) ?? 0).toNumber()
                    return {
                        quantity: new BigNumber(order.quantity).toNumber(),
                        expirationTime: order.side === OrderSide.Sell ? order.listingTime : order.expirationTime,
                        paymentTokenContract: order.paymentTokenContract,
                        hash: order.hash,
                        unitPrice,
                        paytmenToken: order.paymentToken,
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
            case CollectibleProvider.RARIBLE:
                return PluginCollectibleRPC.getOrderFromRarbile(token.contractAddress, token.tokenId, side)
            default:
                unreachable(provider)
        }
    }, [toTokenIdentifier(token), pageNum, provider])
}
