import urlcat from 'urlcat'
import { head, uniqBy } from 'lodash-unified'
import BigNumber from 'bignumber.js'
import isAfter from 'date-fns/isAfter'
import {
    ChainId,
    EthereumTokenType,
    createERC721Contract,
    createNativeToken,
    createERC20Token,
} from '@masknet/web3-shared-evm'
import type { NonFungibleTokenAPI } from '../types'
import { getOrderUSDPrice, toImage } from './utils'
import type {
    OpenSeaAssetContract,
    OpenSeaAssetEvent,
    OpenSeaAssetOrder,
    OpenSeaCollection,
    OpenSeaCustomAccount,
    OpenSeaResponse,
} from './types'
import { OPENSEA_ACCOUNT_URL, OPENSEA_API_KEY, OPENSEA_API_URL } from './constants'
import { isProxyENV } from '../helpers'
import { CurrencyType, TokenType, Web3Plugin } from '@masknet/plugin-infra'
import getUnixTime from 'date-fns/getUnixTime'

async function fetchFromOpenSea<T>(url: string, chainId: ChainId, apiKey?: string) {
    if (![ChainId.Mainnet, ChainId.Rinkeby].includes(chainId)) return

    try {
        const response = await fetch(urlcat(OPENSEA_API_URL, url), {
            method: 'GET',
            headers: { 'x-api-key': apiKey ?? OPENSEA_API_KEY, Accept: 'application/json' },
            ...(!isProxyENV() && { mode: 'cors' }),
        })
        if (response.ok) {
            return (await response.json()) as T
        }
        return
    } catch {
        return
    }
}

function createTokenDetailed(
    chainId: ChainId,
    token: {
        address: string
        decimals: number
        name: string
        symbol: string
    },
) {
    if (token.symbol === 'ETH') return createNativeToken(chainId)
    return createERC20Token(chainId, token.address, token.decimals, token.name, token.symbol)
}

function createAssetLink(account: OpenSeaCustomAccount | undefined) {
    if (!account) return ''
    return urlcat(OPENSEA_ACCOUNT_URL, {
        address: account?.user?.username ?? account?.address,
    })
}

function createNFTToken(chainId: ChainId, asset: OpenSeaResponse): Web3Plugin.NonFungibleToken {
    return {
        id: asset.token_address,
        chainId,
        type: TokenType.NonFungible,
        subType: EthereumTokenType.ERC721,
        tokenId: asset.token_id,
        address: asset.token_address,
        metadata: {
            name: asset.name ?? asset.collection.name,
            symbol: asset.asset_contract.token_symbol,
            description: asset.description,
            imageURL:
                asset.animation_url ?? asset.image_original_url ?? asset.image_url ?? asset.image_preview_url ?? '',
            mediaURL:
                asset?.animation_url ??
                toImage(asset?.image_original_url ?? asset?.image_preview_url ?? asset?.image_url ?? ''),
        },
        contract: {
            type: EthereumTokenType.ERC721,
            chainId,
            address: asset.token_address,
            name: asset.name ?? asset.collection.name,
            symbol: asset.asset_contract.token_symbol,
        },
        collection: {
            name: asset.collection.name,
            slug: asset.collection.slug,
            description: asset.collection.description,
            iconURL:
                asset.collection.image_url ?? asset.collection.largeImage_url ?? asset.collection.featured_image_url,
            verified: ['approved', 'verified'].includes(asset.collection?.safelist_request_status ?? ''),
            createdAt: getUnixTime(new Date(asset.collection.created_date)),
        },
    }
}

function createNFTAsset(chainId: ChainId, asset: OpenSeaResponse): Web3Plugin.NonFungibleAsset {
    const desktopOrder = head(
        asset.orders?.sort((a, b) =>
            new BigNumber(getOrderUSDPrice(b.current_price, b.payment_token_contract?.usd_price) ?? 0)
                .minus(getOrderUSDPrice(a.current_price, a.payment_token_contract?.usd_price) ?? 0)
                .toNumber(),
        ),
    )

    return {
        ...createNFTToken(chainId, asset),
        auction: {
            isAuction: isAfter(Date.parse(`${asset.endTime ?? ''}Z`), Date.now()),
            endAt: getUnixTime(new Date(asset.endTime)),
            orderTokens: uniqBy(
                desktopOrder?.payment_token_contract
                    ? [createTokenDetailed(chainId, desktopOrder.payment_token_contract)]
                    : [],
                (x) => x.address.toLowerCase(),
            ),
            offerTokens: uniqBy(
                asset.collection.payment_tokens.map((x) => createTokenDetailed(chainId, x)),
                (x) => x.address.toLowerCase(),
            ),
        },
        creator: {
            address: asset.creator.address,
            nickname: asset.creator.user?.username ?? 'Unknown',
            avatarURL: asset.creator.profile_img_url,
            link: createAssetLink(asset.creator),
        },
        owner: {
            address: asset.owner.address,
            nickname: asset.owner.user?.username ?? 'Unknown',
            avatarURL: asset.owner.profile_img_url,
            link: createAssetLink(asset.owner),
        },
        traits: asset.traits.map((x) => ({
            type: x.trait_type,
            value: x.value,
        })),
        orders: asset.orders
            ?.sort((a, z) =>
                new BigNumber(getOrderUSDPrice(z.current_price, z.payment_token_contract?.usd_price) ?? 0)
                    .minus(getOrderUSDPrice(a.current_price, a.payment_token_contract?.usd_price) ?? 0)
                    .toNumber(),
            )
            .map((x) => ({
                quantity: Number.parseInt(x.quantity, 10),
                createdAt: x.created_time ? getUnixTime(new Date(x.created_time)) : undefined,
                expiredAt: x.expiration_time,
                side: x.side,
                price: {
                    [CurrencyType.USD]: x.current_price,
                },
                paymentToken: x.payment_token
                    ? {
                          id: x.payment_token,
                          chainId,
                          type: TokenType.Fungible,
                          subType: EthereumTokenType.ERC20,
                          name: 'Unknown Token',
                          symbol: 'UNKNOWN',
                          address: x.payment_token,
                      }
                    : undefined,
            })),
    }
}

// function createNFTHistory(event: OpenSeaAssetEvent): Web3Plugin.NonFungibleAsset['events'] {
//     const accountPair =
//         event.event_type === 'successful'
//             ? {
//                   from: {
//                       username: event.seller?.user?.username,
//                       address: event.seller?.address,
//                       imageUrl: event.seller?.profile_img_url,
//                       link: createAssetLink(event.seller),
//                   },
//                   to: {
//                       username: event.winner_account?.user?.username,
//                       address: event.winner_account?.address,
//                       imageUrl: event.winner_account?.profile_img_url,
//                       link: createAssetLink(event.winner_account),
//                   },
//               }
//             : {
//                   from: {
//                       username: event.from_account?.user?.username,
//                       address: event.from_account?.address,
//                       imageUrl: event.from_account?.profile_img_url,
//                       link: createAssetLink(event.from_account),
//                   },
//                   to: {
//                       username: event.to_account?.user?.username,
//                       address: event.to_account?.address,
//                       imageUrl: event.to_account?.profile_img_url,
//                       link: createAssetLink(event.to_account),
//                   },
//               }
//     return {
//         id: event.id,
//         accountPair,
//         price: {
//             quantity: event.quantity,
//             asset: event.asset,
//             paymentToken: event.payment_token,
//             price: event.bid_amount ?? event.ending_price ?? event.starting_price,
//         },
//         eventType: event.event_type,
//         transactionBlockExplorerLink: event.transaction?.blockExplorerLink,
//         timestamp: new Date(`${event.created_date}Z`).getTime(),
//     }
// }

// function createAssetOrder(order: OpenSeaAssetOrder): Web3Plugin.NonFungibleAsset['orders'] {
//     return {
//         created_time: order.created_time,
//         current_price: order.current_price,
//         current_bounty: order.current_bounty,
//         maker_account: { ...order.maker, link: '' },
//         taker_account: { ...order.taker, link: '' },
//         payment_token: order.payment_token,
//         payment_token_contract: order.payment_token_contract,
//         fee_recipient_account: order.fee_recipient,
//         cancelled_or_finalized: order.cancelled || order.finalized,
//         marked_invalid: order.marked_invalid,
//         approved_on_chain: order.approved_on_chain,
//         listing_time: order.listing_time,
//         side: order.side,
//         quantity: order.quantity,
//         expiration_time: order.expiration_time,
//         order_hash: order.order_hash,
//     }
// }

export class OpenSeaAPI implements NonFungibleTokenAPI.Provider {
    private readonly _apiKey
    constructor(apiKey?: string) {
        this._apiKey = apiKey
    }
    async getAsset(address: string, tokenId: string, { chainId = ChainId.Mainnet } = {}) {
        const requestPath = urlcat('/api/v1/asset/:address/:tokenId', { address, tokenId })
        const response = await fetchFromOpenSea<OpenSeaResponse>(requestPath, chainId)
        if (!response) return
        return createNFTAsset(chainId, response)
    }

    async getContract(address: string, { chainId = ChainId.Mainnet } = {}) {
        const requestPath = urlcat('/api/v1/asset_contract/:address', { address })
        const assetContract = await fetchFromOpenSea<OpenSeaAssetContract>(requestPath, chainId)
        return createERC721Contract(
            chainId,
            address,
            assetContract?.name,
            assetContract?.token_symbol,
            undefined,
            assetContract?.image_url,
        )
    }

    async getToken(address: string, tokenId: string, { chainId = ChainId.Mainnet } = {}) {
        const requestPath = urlcat('/api/v1/asset/:address/:tokenId', { address, tokenId })
        const response = await fetchFromOpenSea<OpenSeaResponse>(requestPath, chainId)
        if (!response) return
        return createNFTAsset(chainId, response)
    }

    async getTokens(from: string, { chainId = ChainId.Mainnet, page = 0, size = 50 } = {}) {
        const requestPath = urlcat('/api/v1/assets', {
            owner: from,
            offset: page * size,
            limit: size,
            // collection: opts.pageInfo?.collection,
        })
        const response = await fetchFromOpenSea<{ assets?: OpenSeaResponse[] }>(requestPath, chainId, this._apiKey)
        const tokens = (response?.assets ?? [])
            ?.filter(
                (x: OpenSeaResponse) =>
                    ['non-fungible', 'semi-fungible'].includes(x.asset_contract.asset_contract_type) ||
                    ['ERC721', 'ERC1155'].includes(x.asset_contract.schema_name),
            )
            .map((asset: OpenSeaResponse) => createNFTToken(chainId, asset))
        return {
            data: tokens,
            hasNextPage: tokens.length === size,
        }
    }

    // async getHistory(
    //     address: string,
    //     tokenId: string,
    //     { chainId = ChainId.Mainnet, page, size }: NonFungibleTokenAPI.Options = {},
    // ) {
    //     const requestPath = urlcat('/api/v1/events', {
    //         asset_contract_address: address,
    //         token_id: tokenId,
    //         offset: page,
    //         limit: size,
    //     })
    //     const response = await fetchFromOpenSea<{
    //         asset_events: OpenSeaAssetEvent[]
    //     }>(requestPath, chainId)
    //     return response?.asset_events?.map(createNFTHistory) ?? []
    // }

    // async getOrders(
    //     address: string,
    //     tokenId: string,
    //     side: NonFungibleTokenAPI.OrderSide,
    //     { chainId = ChainId.Mainnet, page, size }: NonFungibleTokenAPI.Options = {},
    // ) {
    //     const requestPath = urlcat('/wyvern/v1/orders', {
    //         asset_contract_address: address,
    //         token_id: tokenId,
    //         side,
    //         offset: page,
    //         limit: size,
    //     })
    //     const response = await fetchFromOpenSea<{
    //         orders: OpenSeaAssetOrder[]
    //     }>(requestPath, chainId)
    //     return response?.orders?.map(createAssetOrder) ?? []
    // }

    async getCollections(
        address: string,
        { chainId = ChainId.Mainnet, page = 0, size = 50 }: NonFungibleTokenAPI.Options = {},
    ) {
        const requestPath = urlcat('/api/v1/collections', {
            asset_owner: address,
            offset: page * size,
            limit: size,
        })
        const response = await fetchFromOpenSea<OpenSeaCollection[]>(requestPath, chainId, this._apiKey)
        if (!response) {
            return {
                data: [],
                hasNextPage: false,
            }
        }

        const collections =
            response?.map((x) => ({
                name: x.name,
                slug: x.slug,
                description: x.description,
                iconURL: x.image_url,
                verified: ['approved', 'verified'].includes(x.safelist_request_status ?? ''),
                createdAt: getUnixTime(new Date(x.created_date)),
            })) ?? []

        return {
            data: collections,
            hasNextPage: collections.length === size,
        }
    }
}

export function getOpenSeaNFTList(apiKey: string, address: string, page?: number, size?: number) {
    const opensea = new OpenSeaAPI(apiKey)
    return opensea.getTokens(address, { page, size })
}

export function getOpenSeaCollectionList(apiKey: string, address: string, page?: number, size?: number) {
    const opensea = new OpenSeaAPI(apiKey)
    return opensea.getCollections(address, { page, size })
}
