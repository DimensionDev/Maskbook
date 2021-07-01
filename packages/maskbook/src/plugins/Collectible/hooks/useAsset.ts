import { unreachable } from '@dimensiondev/kit'
import {
    currySameAddress,
    EthereumTokenType,
    FungibleTokenDetailed,
    isSameAddress,
    useAccount,
    useChainId,
    useTokenConstants,
} from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { head, uniqBy } from 'lodash-es'
import { useAsyncRetry } from 'react-use'
import { OpenSeaAccountURL } from '../constants'
import { toDate, toRaribleImage, toTokenDetailed, toTokenIdentifier } from '../helpers'
import { PluginCollectibleRPC } from '../messages'
import { resolveRaribleUserNetwork } from '../pipes'
import { CollectibleProvider, CollectibleToken } from '../types'
import { getOrderUnitPrice } from '../utils'

export function useAsset(provider: CollectibleProvider, token?: CollectibleToken) {
    const account = useAccount()
    const chainId = useChainId()
    const { WETH_ADDRESS } = useTokenConstants()

    return useAsyncRetry(async () => {
        if (!token) return
        switch (provider) {
            case CollectibleProvider.OPENSEA:
                const openSeaResponse = await PluginCollectibleRPC.getAsset(token.contractAddress, token.tokenId)
                const desktopOrder = head(
                    (openSeaResponse.sellOrders ?? []).sort(
                        (a, b) =>
                            new BigNumber(getOrderUnitPrice(a) ?? 0).toNumber() -
                            new BigNumber(getOrderUnitPrice(b) ?? 0).toNumber(),
                    ),
                )
                return {
                    is_verified: ['approved', 'verified'].includes(
                        openSeaResponse.collection?.safelist_request_status ?? '',
                    ),
                    is_order_weth: isSameAddress(desktopOrder?.paymentToken ?? '', WETH_ADDRESS),
                    is_collection_weth: openSeaResponse.collection.payment_tokens.some(currySameAddress(WETH_ADDRESS)),
                    is_owner: openSeaResponse.top_ownerships.some((item) => isSameAddress(item.owner.address, account)),
                    // it's an IOS string as my inspection
                    is_auction: Date.parse(`${openSeaResponse.endTime ?? ''}Z`) > Date.now(),
                    image_url: openSeaResponse.imageUrl,
                    asset_contract: openSeaResponse.assetContract,
                    current_price: desktopOrder ? new BigNumber(getOrderUnitPrice(desktopOrder) ?? 0).toNumber() : null,
                    current_symbol: desktopOrder?.paymentTokenContract?.symbol ?? 'ETH',
                    owner: {
                        ...openSeaResponse.owner,
                        link: `${OpenSeaAccountURL}${
                            openSeaResponse.owner?.user?.username ?? openSeaResponse.owner.address ?? ''
                        }`,
                    },
                    creator: {
                        ...openSeaResponse.creator,
                        link: `${OpenSeaAccountURL}${
                            openSeaResponse.creator?.user?.username ?? openSeaResponse.creator?.address ?? ''
                        }`,
                    },
                    token_id: openSeaResponse.tokenId,
                    token_address: openSeaResponse.tokenAddress,
                    traits: openSeaResponse.traits,
                    safelist_request_status: openSeaResponse.collection?.safelist_request_status ?? '',
                    description: openSeaResponse.description,
                    name: openSeaResponse.name,
                    collection_name: openSeaResponse.collection.name,
                    animation_url: openSeaResponse.animation_url,
                    end_time: desktopOrder
                        ? toDate(Number.parseInt(desktopOrder.listingTime as unknown as string))
                        : null,
                    order_payment_tokens: desktopOrder?.paymentTokenContract
                        ? [toTokenDetailed(chainId, desktopOrder.paymentTokenContract)]
                        : [],
                    offer_payment_tokens: uniqBy(
                        openSeaResponse.collection.payment_tokens.map((x) => toTokenDetailed(chainId, x)),
                        (x) => x.address.toLowerCase(),
                    ).filter((x) => x.type === EthereumTokenType.ERC20),
                    order_: desktopOrder,
                    slug: openSeaResponse.collection.slug,
                    response_: openSeaResponse,
                }
            case CollectibleProvider.RARIBLE:
                const raribleResponse = await PluginCollectibleRPC.getNFTItem(token.contractAddress, token.tokenId)
                return {
                    is_order_weth: false,
                    is_collection_weth: false,
                    is_verified: false,
                    is_owner: false,
                    is_auction: false,
                    image_url:
                        raribleResponse.properties.imagePreview ?? toRaribleImage(raribleResponse.properties.image),
                    asset_contract: {
                        ...raribleResponse.assetContract,
                        schemaName: raribleResponse.assetContract.standard,
                        description: raribleResponse.assetContract.description,
                    },
                    owner: raribleResponse.owner
                        ? {
                              address: raribleResponse.owner.id,
                              profile_img_url: toRaribleImage(raribleResponse.owner.image),
                              user: { username: raribleResponse.owner.name },
                              link: `${resolveRaribleUserNetwork(chainId)}${raribleResponse.owner.id ?? ''}`,
                          }
                        : null,
                    creator: raribleResponse.creator
                        ? {
                              address: raribleResponse.creator.id,
                              profile_img_url: toRaribleImage(raribleResponse.creator.image),
                              user: { username: raribleResponse.creator.name },
                              link: `${resolveRaribleUserNetwork(chainId)}${raribleResponse.creator.id ?? ''}`,
                          }
                        : null,
                    traits: raribleResponse.properties.attributes.map(({ key, value }) => ({ trait_type: key, value })),
                    description: raribleResponse.properties.description,
                    name: raribleResponse.properties.name,
                    collection_name: '',
                    animation_url: raribleResponse.properties.animationUrl,
                    current_price: raribleResponse.item.offer?.buyPriceEth,
                    current_symbol: 'ETH',
                    end_time: null,
                    order_payment_tokens: [] as FungibleTokenDetailed[],
                    offer_payment_tokens: [] as FungibleTokenDetailed[],
                    order_: null,
                    slug: raribleResponse.assetContract.shortUrl,
                    response_: raribleResponse,
                }
            default:
                unreachable(provider)
        }
    }, [toTokenIdentifier(token), account, chainId, provider, WETH_ADDRESS])
}
