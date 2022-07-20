import urlcat from 'urlcat'
import { head, uniqBy } from 'lodash-unified'
import BigNumber from 'bignumber.js'
import isAfter from 'date-fns/isAfter'
import getUnixTime from 'date-fns/getUnixTime'
import LRU, { Options as LRUOptions } from 'lru-cache'
import {
    createPageable,
    CurrencyType,
    NonFungibleToken,
    NonFungibleTokenCollection,
    NonFungibleTokenEvent,
    NonFungibleTokenOrder,
    OrderSide,
    scale10,
    TokenType,
    HubOptions,
    createNonFungibleTokenContract,
    createIndicator,
    createNextIndicator,
    NonFungibleAsset,
    formatBalance,
} from '@masknet/web3-shared-base'
import { ChainId, SchemaType, createNativeToken, createERC20Token } from '@masknet/web3-shared-evm'
import type { NonFungibleTokenAPI, TrendingAPI } from '../types'
import type {
    OpenSeaAssetContract,
    OpenSeaAssetEvent,
    OpenSeaAssetOrder,
    OpenSeaCollection,
    OpenSeaCollectionStats,
    OpenSeaCustomAccount,
    OpenSeaResponse,
} from './types'
import { getOrderUSDPrice, toImage } from './utils'
import { OPENSEA_ACCOUNT_URL, OPENSEA_API_URL } from './constants'
import { EMPTY_LIST } from '@masknet/shared-base'

const cache = new LRU<string, any>({
    max: 50,
    ttl: 30_000,
})

export async function fetchFromOpenSea<T>(url: string, chainId: ChainId, options?: LRUOptions<string, any>) {
    if (![ChainId.Mainnet, ChainId.Rinkeby, ChainId.Matic].includes(chainId)) return
    const cacheKey = `${chainId}/${url}`
    let fetchingTask = cache.get(cacheKey)
    if (!fetchingTask) {
        const fetch = globalThis.r2d2Fetch ?? globalThis.fetch

        fetchingTask = fetch(urlcat(OPENSEA_API_URL, url), { method: 'GET' })
        cache.set(cacheKey, fetchingTask, options)
    }
    const response = (await fetchingTask).clone()
    if (response.ok) {
        return (await response.json()) as T
    } else {
        cache.delete(cacheKey)
        throw new Error('Fetch failed')
    }
}

function createTokenDetailed(
    chainId: ChainId,
    token: {
        address: string
        decimals: number
        name: string
        symbol: string
        image_url?: string
    },
) {
    if (token.symbol === 'ETH') return createNativeToken(chainId)
    return createERC20Token(chainId, token.address, token.name, token.symbol, token.decimals, token.image_url)
}

function createAssetLink(account: OpenSeaCustomAccount | undefined) {
    if (!account) return ''
    return urlcat(OPENSEA_ACCOUNT_URL, {
        address: account?.user?.username ?? account?.address,
    })
}

function createNFTToken(chainId: ChainId, asset: OpenSeaResponse): NonFungibleToken<ChainId, SchemaType> {
    return {
        id: asset.token_address ?? asset.asset_contract.address,
        chainId,
        type: TokenType.NonFungible,
        schema: asset.asset_contract.schema_name === 'ERC1155' ? SchemaType.ERC1155 : SchemaType.ERC721,
        tokenId: asset.token_id,
        address: asset.token_address ?? asset.asset_contract.address,
        metadata: {
            chainId,
            name: asset.name ?? asset.collection.name,
            symbol: asset.asset_contract.symbol,
            description: asset.description,
            imageURL:
                asset.image_url ?? asset.image_preview_url ?? asset.image_original_url ?? asset.animation_url ?? '',
            mediaURL:
                asset?.animation_url ??
                toImage(asset?.image_original_url ?? asset?.image_preview_url ?? asset?.image_url ?? ''),
        },
        contract: {
            chainId,
            schema: SchemaType.ERC721,
            address: asset.token_address ?? asset.asset_contract.address,
            name: asset.name ?? asset.collection.name,
            symbol: asset.asset_contract.symbol,
            owner: asset.owner.address,
        },
        collection: {
            address: asset.token_address ?? asset.asset_contract.address,
            chainId,
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

function createNFTAsset(chainId: ChainId, asset: OpenSeaResponse): NonFungibleAsset<ChainId, SchemaType> {
    const desktopOrder = head(
        asset.orders?.sort((a, b) =>
            new BigNumber(getOrderUSDPrice(b.current_price, b.payment_token_contract?.usd_price) ?? 0)
                .minus(getOrderUSDPrice(a.current_price, a.payment_token_contract?.usd_price) ?? 0)
                .toNumber(),
        ),
    )
    const orderTokens = uniqBy(
        desktopOrder?.payment_token_contract
            ? [createTokenDetailed(chainId, desktopOrder.payment_token_contract)]
            : EMPTY_LIST,
        (x) => x.address.toLowerCase(),
    )
    const offerTokens = uniqBy(
        asset.collection?.payment_tokens?.map((x) => createTokenDetailed(chainId, x)),
        (x) => x.address.toLowerCase(),
    )
    return {
        ...createNFTToken(chainId, asset),
        link: asset.opensea_link ?? asset.permalink,
        paymentTokens: orderTokens.concat(offerTokens),
        auction: isAfter(Date.parse(`${asset.endTime ?? ''}Z`), Date.now())
            ? {
                  endAt: getUnixTime(new Date(asset.endTime)),
                  orderTokens,
                  offerTokens,
              }
            : undefined,
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
        price: asset.last_sale
            ? {
                  [CurrencyType.USD]: getOrderUSDPrice(
                      asset.last_sale.total_price,
                      asset.last_sale.payment_token.usd_price,
                      asset.last_sale.payment_token.decimals,
                  )?.toString(),
              }
            : undefined,
        priceInToken: asset.last_sale
            ? {
                  token: createTokenDetailed(chainId, {
                      address: asset.last_sale.payment_token.address ?? '',
                      decimals: Number(asset.last_sale.payment_token.decimals ?? '0'),
                      name: '',
                      symbol: asset.last_sale.payment_token.symbol ?? '',
                  }),
                  amount: formatBalance(
                      new BigNumber(asset.last_sale.total_price ?? '0'),
                      asset.last_sale.payment_token.decimals,
                  ),
              }
            : undefined,
        orders: asset.orders
            ?.sort((a, z) =>
                new BigNumber(getOrderUSDPrice(z.current_price, z.payment_token_contract?.usd_price) ?? 0)
                    .minus(getOrderUSDPrice(a.current_price, a.payment_token_contract?.usd_price) ?? 0)
                    .toNumber(),
            )
            .map((x) => ({
                id: x.order_hash,
                chainId,
                assetPermalink: asset.opensea_link,
                hash: x.order_hash,
                quantity: x.quantity,
                createdAt: x.created_time ? getUnixTime(new Date(x.created_time)) : undefined,
                expiredAt: x.expiration_time,
                side: x.side,
                price: {
                    [CurrencyType.USD]: x.current_price,
                },
                paymentToken: x.payment_token_contract
                    ? createERC20Token(
                          chainId,
                          x.payment_token_contract.address,
                          x.payment_token_contract.name,
                          x.payment_token_contract.symbol,
                          x.payment_token_contract.decimals,
                          x.payment_token_contract.image_url,
                      )
                    : undefined,
            })),
    }
}

function createNFTHistory(chainId: ChainId, event: OpenSeaAssetEvent): NonFungibleTokenEvent<ChainId, SchemaType> {
    const accountPair =
        event.event_type === 'successful'
            ? {
                  from: {
                      address: event.seller?.address,
                      nickname: event.seller?.user?.username,
                      avatarURL: event.seller?.profile_img_url,
                      link: createAssetLink(event.seller),
                  },
                  to: {
                      address: event.winner_account?.address,
                      nickname: event.winner_account?.user?.username,
                      avatarURL: event.winner_account?.profile_img_url,
                      link: createAssetLink(event.winner_account),
                  },
              }
            : {
                  from: {
                      address: event.from_account?.address,
                      nickname: event.from_account?.user?.username,
                      avatarURL: event.from_account?.profile_img_url,
                      link: createAssetLink(event.from_account),
                  },
                  to: {
                      address: event.to_account?.address,
                      nickname: event.to_account?.user?.username,
                      avatarURL: event.to_account?.profile_img_url,
                      link: createAssetLink(event.to_account),
                  },
              }
    return {
        ...accountPair,
        id: event.id,
        chainId,
        type: event.event_type,
        assetPermalink: event.asset.permalink,
        quantity: event.quantity,
        hash: event.transaction?.transaction_hash,
        timestamp: new Date(`${event.created_date}Z`).getTime(),
        price: {
            [CurrencyType.USD]: new BigNumber(event.bid_amount ?? event.total_price ?? 0)
                .dividedBy(scale10(event.payment_token.decimals))
                .dividedBy(event.quantity)
                .multipliedBy(event.payment_token?.usd_price ?? 1)
                .toFixed(2),
        },
        paymentToken: event.payment_token
            ? createERC20Token(
                  ChainId.Mainnet,
                  event.payment_token.address,
                  event.payment_token.name,
                  event.payment_token.symbol,
                  event.payment_token.decimals,
                  event.payment_token.image_url,
              )
            : undefined,
    }
}

function createAssetOrder(chainId: ChainId, order: OpenSeaAssetOrder): NonFungibleTokenOrder<ChainId, SchemaType> {
    return {
        id: order.order_hash,
        chainId,
        assetPermalink: order.asset.opensea_link,
        hash: order.order_hash,
        quantity: order.quantity,
        side: order.side,
        maker: {
            address: order.maker.address,
            nickname: order.maker.user?.username,
            avatarURL: order.maker.profile_img_url,
            link: urlcat('https://opensea.io/accounts/:address', { address: order.maker.address }),
        },
        taker: {
            address: order.taker.address,
            nickname: order.taker.user?.username,
            avatarURL: order.taker.profile_img_url,
        },
        createdAt: order.created_time ? getUnixTime(new Date(order.created_time)) : undefined,
        expiredAt: order.expiration_time,
        price: {
            [CurrencyType.USD]: new BigNumber(order.base_price ?? 0)
                .dividedBy(scale10(order.payment_token_contract?.decimals ?? 0))
                .dividedBy(order.quantity)
                .multipliedBy(order.payment_token_contract?.usd_price ?? 1)
                .toFixed(2),
        },
        paymentToken: order.payment_token_contract
            ? createERC20Token(
                  ChainId.Mainnet,
                  order.payment_token_contract.address,
                  order.payment_token_contract.name,
                  order.payment_token_contract.symbol,
                  order.payment_token_contract.decimals,
                  order.payment_token_contract.image_url,
              )
            : undefined,
    }
}

export class OpenSeaAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getAsset(address: string, tokenId: string, { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {}) {
        const response = await fetchFromOpenSea<OpenSeaResponse>(
            urlcat('/api/v1/asset/:address/:tokenId', { address, tokenId }),
            chainId,
        )
        if (!response) return
        return createNFTAsset(chainId, response)
    }

    async getAssets(account: string, { chainId = ChainId.Mainnet, indicator, size = 50 }: HubOptions<ChainId> = {}) {
        if (chainId !== ChainId.Mainnet) return createPageable(EMPTY_LIST, createIndicator(indicator))

        const response = await fetchFromOpenSea<{ assets?: OpenSeaResponse[] }>(
            urlcat('/api/v1/assets', {
                owner: account,
                offset: (indicator?.index ?? 0) * size,
                limit: size,
            }),
            chainId,
        )

        const tokens = (response?.assets ?? EMPTY_LIST)
            ?.filter(
                (x: OpenSeaResponse) =>
                    ['non-fungible', 'semi-fungible'].includes(x.asset_contract.asset_contract_type) ||
                    ['ERC721', 'ERC1155'].includes(x.asset_contract.schema_name),
            )
            .map((asset: OpenSeaResponse) => createNFTAsset(chainId, asset))

        return createPageable(
            tokens,
            createIndicator(indicator),
            tokens.length === size ? createNextIndicator(indicator) : undefined,
        )
    }

    async getToken(address: string, tokenId: string, { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {}) {
        const response = await fetchFromOpenSea<OpenSeaResponse>(
            urlcat('/api/v1/asset/:address/:tokenId', { address, tokenId }),
            chainId,
        )
        if (!response) return
        return createNFTToken(chainId, response)
    }

    async getContract(address: string, { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {}) {
        const assetContract = await fetchFromOpenSea<OpenSeaAssetContract>(
            urlcat('/api/v1/asset_contract/:address', { address }),
            chainId,
        )
        const result = createNonFungibleTokenContract(
            chainId,
            SchemaType.ERC721,
            address,
            assetContract?.name ?? 'Unknown Token',
            assetContract?.symbol ?? 'UNKNOWN',
        )
        return result
    }

    async getEvents(
        address: string,
        tokenId: string,
        { chainId = ChainId.Mainnet, indicator, size }: HubOptions<ChainId> = {},
    ) {
        const response = await fetchFromOpenSea<{
            asset_events: OpenSeaAssetEvent[]
        }>(
            urlcat('/api/v1/events', {
                asset_contract_address: address,
                token_id: tokenId,
                offset: indicator,
                limit: size,
            }),
            chainId,
        )
        const events = response?.asset_events?.map((x) => createNFTHistory(chainId, x)) ?? EMPTY_LIST
        return createPageable(
            events,
            createIndicator(indicator),
            events.length === size ? createNextIndicator(indicator) : undefined,
        )
    }

    async getOrders(
        address: string,
        tokenId: string,
        side: OrderSide,
        { chainId = ChainId.Mainnet, indicator, size }: HubOptions<ChainId> = {},
    ) {
        const response = await fetchFromOpenSea<{
            orders: OpenSeaAssetOrder[]
        }>(
            urlcat('/wyvern/v1/orders', {
                asset_contract_address: address,
                token_id: tokenId,
                side,
                offset: indicator,
                limit: size,
            }),
            chainId,
        )
        const orders = response?.orders?.map((x) => createAssetOrder(chainId, x)) ?? EMPTY_LIST
        return createPageable(
            orders,
            createIndicator(indicator),
            orders.length === size ? createNextIndicator(indicator) : undefined,
        )
    }

    async getCollections(
        address: string,
        { chainId = ChainId.Mainnet, indicator, size = 50 }: HubOptions<ChainId> = {},
    ) {
        if (chainId !== ChainId.Mainnet) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const response = await fetchFromOpenSea<OpenSeaCollection[]>(
            urlcat('/api/v1/collections', {
                asset_owner: address,
                offset: (indicator?.index ?? 0) * size,
                limit: size,
            }),
            chainId,
        )
        if (!response) return createPageable(EMPTY_LIST, createIndicator(indicator))

        const collections: Array<NonFungibleTokenCollection<ChainId>> =
            response
                ?.map((x) => ({
                    chainId,
                    name: x.name,
                    slug: x.slug,
                    address: x.primary_asset_contracts?.[0]?.address,
                    symbol: x.primary_asset_contracts?.[0]?.symbol,
                    schema_name: x.primary_asset_contracts?.[0]?.schema_name,
                    description: x.description,
                    iconURL: x.image_url,
                    balance: x.owned_asset_count,
                    verified: ['approved', 'verified'].includes(x.safelist_request_status ?? ''),
                    createdAt: getUnixTime(new Date(x.created_date)),
                }))
                .filter((x) => x.address) ?? EMPTY_LIST

        return createPageable(
            collections,
            createIndicator(indicator),
            collections.length === size ? createNextIndicator(indicator) : undefined,
        )
    }

    async getCollectionStats(
        address: string,
        { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {},
    ): Promise<OpenSeaCollectionStats | undefined> {
        const assetContract = await fetchFromOpenSea<OpenSeaAssetContract>(
            urlcat('/api/v1/asset_contract/:address', { address }),
            chainId,
            {
                ttl: 0,
            },
        )
        const slug = assetContract?.collection.slug
        if (!slug) return
        const response = await fetchFromOpenSea<{ stats: OpenSeaCollectionStats }>(
            urlcat('/api/v1/collection/:slug/stats', {
                slug,
            }),
            chainId,
        )
        return response?.stats
    }

    async getCoinTrending(chainId: ChainId, id: string, currency: TrendingAPI.Currency): Promise<TrendingAPI.Trending> {
        throw new Error('Not implemented yet.')
    }
}
