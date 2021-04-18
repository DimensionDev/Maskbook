import { useAsyncRetry } from 'react-use'
import { useChainId } from '../../../web3/hooks/useBlockNumber'
import { PluginCollectibleRPC } from '../messages'
import type { CollectibleToken } from '../types'
import { CollectibleProvider } from '../types'
import { head, subtract } from 'lodash-es'
import BigNumber from 'bignumber.js'
import { getOrderUnitPrice } from '../utils'
import { unreachable } from '../../../utils/utils'
import { toRaribleImage } from '../helpers'
import { OpenSeaAccountURL, RaribleUserURL } from '../constants'

export function useAsset(provider: CollectibleProvider, token?: CollectibleToken) {
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
                    currentPrice,
                    owner: {
                        ...response.owner,
                        link: `${OpenSeaAccountURL}${response.owner?.user?.username ?? response.owner.address ?? ''}`,
                    },
                    creator: {
                        ...response.creator,
                        link: `${OpenSeaAccountURL}${
                            response.creator?.user?.username ?? response.creator?.address ?? ''
                        }`,
                    },
                    traits: response.traits,
                    safelist_request_status: response.collection?.safelist_request_status ?? '',
                    description: response.description,
                    name: response.name,
                    animation_url: response.animation_url,
                }
            case CollectibleProvider.RARIBLE:
                const result = await PluginCollectibleRPC.getNFTItem(token.contractAddress, token.tokenId)
                return {
                    imageUrl: toRaribleImage(result.properties.image),
                    assetContract: {
                        ...result.assetContract,
                        schemaName: result.assetContract.standard,
                        description: result.assetContract.description,
                    },
                    owner: result.owner
                        ? {
                              address: result.owner.id,
                              profile_img_url: toRaribleImage(result.owner.image),
                              user: { username: result.owner.name },
                              link: `${RaribleUserURL}${result.owner.id ?? ''}`,
                          }
                        : null,
                    creator: result.creator
                        ? {
                              address: result.creator.id,
                              profile_img_url: toRaribleImage(result.creator.image),
                              user: { username: result.creator.name },
                              link: `${RaribleUserURL}${result.creator.id ?? ''}`,
                          }
                        : null,
                    traits: result.properties.attributes.map(({ key, value }) => ({ trait_type: key, value })),
                    description: result.properties.description,
                    name: result.properties.name,
                    animation_url: result.properties.animationUrl,
                    currentPrice: result.item.offer?.buyPriceEth,
                }
            default:
                unreachable(provider)
        }
    }, [chainId, provider])
}
