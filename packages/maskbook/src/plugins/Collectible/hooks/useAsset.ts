import { useAsyncRetry } from 'react-use'
import { useChainId } from '../../../web3/hooks/useChainState'
import type { CollectibleToken } from '../types'
import { CollectibleProvider } from '../types'
import { PluginCollectibleRPC } from '../messages'
import { head, subtract } from 'lodash-es'
import BigNumber from 'bignumber.js'
import { getOrderUnitPrice } from '../utils'
import { unreachable } from '../../../utils/utils'

export function useAsset(token?: CollectibleToken, provider = CollectibleProvider.OPENSEA) {
    const chainId = useChainId()

    return useAsyncRetry(async () => {
        if (!token) return
        switch (provider) {
            case CollectibleProvider.OPENSEA:
                const response = await PluginCollectibleRPC.getAsset(token.contractAddress, token.tokenId)

                const currentPrice =
                    response.sellOrders && response.sellOrders.length
                        ? head(
                              response.sellOrders
                                  .map((order) => new BigNumber(getOrderUnitPrice(order) ?? 0).toNumber())
                                  .sort(subtract),
                          )
                        : null
                return {
                    imageUrl: response.imageUrl,
                    assetContract: response.assetContract,
                    currentPrice: currentPrice,
                    owner: response.owner,
                    creator: response.creator,
                    traits: response.traits,
                    safelist_request_status: response.collection?.safelist_request_status ?? '',
                    description: response.description,
                    name: response.name,
                    animation_url: response.animation_url,
                }
            case CollectibleProvider.RARIBLE:
                const result = await PluginCollectibleRPC.getNFTItem(token.contractAddress, token.tokenId)
                return {
                    imageUrl: `https://ipfs.rarible.com/${result.properties.image.replace('ipfs://', '')}`,
                    assetContract: {
                        ...result.assetContract,
                        schemaName: result.assetContract.type,
                        description: null,
                    },
                    owner: {
                        address: head(result.owners),
                        user: null,
                        profile_img_url: null,
                    },
                    creator: {
                        address: head(result.creator),
                        user: null,
                        profile_img_url: null,
                    },
                    traits: result.properties.attributes.map(({ key, value }) => ({ trait_type: key, value })),
                    description: result.properties.description,
                    name: result.properties.name,
                    animation_url: result.properties.animation_url
                        ? `https://ipfs.rarible.com/${result.properties.animation_url.replace('ipfs://', '')}`
                        : null,
                }
            default:
                unreachable(provider)
        }
    }, [chainId, provider])
}
