import urlcat from 'urlcat'
import { head, uniqBy } from 'lodash-unified'
import BigNumber from 'bignumber.js'
import isAfter from 'date-fns/isAfter'
import getUnixTime from 'date-fns/getUnixTime'
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
} from '@masknet/web3-shared-base'
import { ChainId, SchemaType, createNativeToken, createERC20Token } from '@masknet/web3-shared-evm'
import type { NonFungibleTokenAPI } from '../types'
import type {
    OpenSeaAssetContract,
    OpenSeaAssetEvent,
    OpenSeaAssetOrder,
    OpenSeaCollection,
    OpenSeaCustomAccount,
    OpenSeaResponse,
} from './types'
import { getOrderUnitPrice, getOrderUSDPrice, toImage } from './utils'
import { OPENSEA_ACCOUNT_URL, OPENSEA_API_URL } from './constants'

async function fetchFromOpenSea<T>(url: string, chainId: ChainId, apiKey?: string) {
    if (![ChainId.Mainnet, ChainId.Rinkeby, ChainId.Matic].includes(chainId)) return
    const fetch = globalThis.r2d2Fetch ?? globalThis.fetch

    const response = await fetch(urlcat(OPENSEA_API_URL, url), { method: 'GET' })
    if (response.ok) {
        return (await response.json()) as T
    } else {
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
    },
) {
    if (token.symbol === 'ETH') return createNativeToken(chainId)
    return createERC20Token(chainId, token.address, token.name, token.symbol, token.decimals)
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
        desktopOrder?.payment_token_contract ? [createTokenDetailed(chainId, desktopOrder.payment_token_contract)] : [],
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
        price: {
            [CurrencyType.USD]: getOrderUnitPrice(
                asset.last_sale?.total_price,
                asset.last_sale?.payment_token.decimals,
                asset.last_sale?.quantity ?? '1',
            )?.toString(),
        },
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
    private readonly _apiKey
    constructor(apiKey?: string) {
        this._apiKey = apiKey
    }
    async getAsset(address: string, tokenId: string, { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {}) {
        const response = await fetchFromOpenSea<OpenSeaResponse>(
            urlcat('/api/v1/asset/:address/:tokenId', { address, tokenId }),
            chainId,
        )

        if (!response) return
        return createNFTAsset(chainId, response)
    }

    async getAssets(from: string, { chainId = ChainId.Mainnet, indicator, size = 50 }: HubOptions<ChainId> = {}) {
        if (chainId !== ChainId.Mainnet) return createPageable([], createIndicator(indicator))

        const response = await fetchFromOpenSea<{ assets?: OpenSeaResponse[] }>(
            urlcat('/api/v1/assets', {
                owner: from,
                offset: (indicator?.index ?? 0) * size,
                limit: size,
            }),
            chainId,
            this._apiKey,
        )

        const tokens = (response?.assets ?? [])
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
        return createNonFungibleTokenContract(
            chainId,
            SchemaType.ERC721,
            address,
            assetContract?.name ?? 'Unknown Token',
            assetContract?.symbol ?? 'UNKNOWN',
        )
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
        return response?.asset_events?.map((x) => createNFTHistory(chainId, x)) ?? []
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
        return response?.orders?.map((x) => createAssetOrder(chainId, x)) ?? []
    }

    async getCollections(
        address: string,
        { chainId = ChainId.Mainnet, indicator, size = 50 }: HubOptions<ChainId> = {},
    ) {
        if (chainId !== ChainId.Mainnet) return createPageable([], createIndicator(indicator))
        const response = await fetchFromOpenSea<OpenSeaCollection[]>(
            urlcat('/api/v1/collections', {
                asset_owner: address,
                offset: (indicator?.index ?? 0) * size,
                limit: size,
            }),
            chainId,
            this._apiKey,
        )
        if (!response) return createPageable([], createIndicator(indicator))

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
                .filter((x) => x.address) ?? []

        return createPageable(
            collections,
            createIndicator(indicator),
            collections.length === size ? createNextIndicator(indicator) : undefined,
        )
    }
}
