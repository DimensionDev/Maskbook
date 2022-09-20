import urlcat from 'urlcat'
import { first } from 'lodash-unified'
import { createLookupTableResolver, EMPTY_LIST } from '@masknet/shared-base'
import {
    HubOptions,
    NonFungibleAsset,
    NonFungibleTokenEvent,
    NonFungibleTokenOrder,
    OrderSide,
    TokenType,
    createPageable,
    createIndicator,
    createNextIndicator,
    CurrencyType,
    scale10,
    SourceType,
} from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { RaribleEventType, RaribleOrder, RaribleHistory, RaribleNFTItemMapResponse } from './types.js'
import { RaribleURL } from './constants.js'
import type { NonFungibleTokenAPI } from '../types/index.js'
import { getPaymentToken } from '../helpers.js'

const resolveRaribleBlockchain = createLookupTableResolver<number, string>(
    {
        [ChainId.Mainnet]: 'ETHEREUM',
        [ChainId.Matic]: 'POLYGON',
    },
    () => 'ETHEREUM',
)

async function fetchFromRarible<T>(url: string, path: string, init?: RequestInit) {
    const response = await fetch(`${url}${path.slice(1)}`, {
        method: 'GET',
        mode: 'cors',
        headers: { 'content-type': 'application/json' },
    })
    return response.json() as Promise<T>
}

function createAddress(address?: string) {
    if (!address) return
    return address.split(':')[1]
}

function createAccount(address?: string) {
    const resolvedAddress = createAddress(address)
    if (!resolvedAddress) return
    return {
        address: resolvedAddress,
    }
}

function createRaribleLink(address: string, tokenId: string) {
    return urlcat('https://rarible.com/token/:address::tokenId', {
        address,
        tokenId,
    })
}

function createAsset(chainId: ChainId, asset: RaribleNFTItemMapResponse): NonFungibleAsset<ChainId, SchemaType.ERC721> {
    return {
        id: asset.id || asset.contract,
        chainId,
        tokenId: asset.tokenId,
        type: TokenType.NonFungible,
        address: asset.contract.split(':')[1],
        schema: SchemaType.ERC721,
        creator: createAccount(first(asset.creators)?.account),
        traits: asset?.meta?.attributes.map(({ key, value }) => ({ type: key, value })) ?? [],
        metadata: {
            chainId,
            name: asset.meta?.name ?? '',
            description: asset.meta?.description,
            imageURL: asset.meta?.content?.find((x) => x['@type'] === 'IMAGE' && x.representation === 'PREVIEW')?.url,
            mediaURL: asset.meta?.content?.find((x) => x['@type'] === 'IMAGE' && x.representation === 'ORIGINAL')?.url,
        },
        contract: {
            chainId,
            schema: SchemaType.ERC721,
            address: asset.contract.split(':')[1],
            name: asset.meta?.name ?? '',
        },
        collection: {
            chainId,
            name: asset.meta?.name ?? '',
            slug: asset.meta?.name ?? '',
            description: asset.meta?.description,
            iconURL: asset.meta?.content?.find((x) => x['@type'] === 'IMAGE' && x.representation === 'PREVIEW')?.url,
            verified: !asset.deleted,
            createdAt: new Date(asset.mintedAt).getTime(),
        },
    }
}

function createOrder(chainId: ChainId, order: RaribleOrder): NonFungibleTokenOrder<ChainId, SchemaType> {
    const paymentToken = getPaymentToken(chainId, {
        name: order.make.type['@type'],
        symbol: order.make.type['@type'],
        address: createAddress(order.make.type.contract),
    })
    return {
        id: order.id,
        chainId,
        assetPermalink: '',
        createdAt: new Date(order.createdAt).getTime(),
        maker: createAccount(order.maker),
        taker: createAccount(order.taker),
        price:
            order.takePriceUsd ?? order.makePriceUsd
                ? {
                      [CurrencyType.USD]: order.takePriceUsd ?? order.makePriceUsd,
                  }
                : undefined,
        priceInToken: paymentToken
            ? {
                  amount: scale10(order.takePrice ?? order.makePrice ?? '0', paymentToken?.decimals).toFixed(),
                  token: paymentToken,
              }
            : undefined,
        side: OrderSide.Buy,
        quantity: order.fill,
        source: SourceType.Rarible,
    }
}

function createEvent(chainId: ChainId, history: RaribleHistory): NonFungibleTokenEvent<ChainId, SchemaType> {
    const paymentToken = getPaymentToken(chainId, {
        name: history.payment?.type['@type'] ?? history.take?.type['@type'],
        symbol: history.payment?.type['@type'] ?? history.take?.type['@type'],
        address: history.make?.type.contract?.split(':')[1] ?? history.take?.type.contract?.split(':')[1],
    })
    return {
        id: history.id,
        chainId,
        from: createAccount(history.from ?? history.seller ?? history.owner ?? history.maker),
        to: createAccount(history.buyer),
        type: history['@type'],
        assetPermalink:
            history.nft?.type.contract && history.nft?.type.tokenId
                ? createRaribleLink(history.nft.type.contract, history.nft.type.tokenId)
                : undefined,
        quantity: history.nft?.value ?? history.value ?? '0',
        timestamp: new Date(history.date).getTime(),
        hash: history.transactionHash ?? history.hash,
        price: history.priceUsd
            ? {
                  [CurrencyType.USD]: history.priceUsd,
              }
            : undefined,
        priceInToken: paymentToken
            ? {
                  amount: scale10(history.price, paymentToken.decimals).toFixed(),
                  token: paymentToken,
              }
            : undefined,
        paymentToken,
        source: SourceType.Rarible,
    }
}

export class RaribleAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getAsset(
        address: string,
        tokenId: string,
        {
            chainId = ChainId.Mainnet,
        }: {
            chainId?: ChainId
        } = {},
    ) {
        const requestPath = `/v0.1/items/${resolveRaribleBlockchain(chainId)}:${address}:${tokenId}`
        const asset = await fetchFromRarible<RaribleNFTItemMapResponse>(RaribleURL, requestPath)
        if (!asset) return
        return createAsset(chainId, asset)
    }

    async getAssets(from: string, { chainId = ChainId.Mainnet, indicator, size = 20 }: HubOptions<ChainId> = {}) {
        if (chainId !== ChainId.Mainnet) return createPageable(EMPTY_LIST, createIndicator(indicator, ''))

        const requestPath = urlcat('/v0.1/items/byOwner', {
            owner: `${resolveRaribleBlockchain(chainId)}:${from}`,
            size,
            blockchains: [resolveRaribleBlockchain(chainId)],
            continuation: indicator?.id,
        })

        const response = await fetchFromRarible<{
            total: number
            continuation: string
            items: RaribleNFTItemMapResponse[]
        }>(RaribleURL, requestPath)
        if (!response) return createPageable(EMPTY_LIST, createIndicator(indicator, ''))

        const items = response.items.map((asset) => ({
            ...createAsset(chainId, asset),
            owner: {
                address: from,
            },
        }))
        return createPageable(items, createIndicator(indicator), createNextIndicator(indicator, response.continuation))
    }

    async getOffers(
        tokenAddress: string,
        tokenId: string,
        { chainId = ChainId.Mainnet, indicator, size = 20 }: HubOptions<ChainId> = {},
    ) {
        const requestPath = urlcat('/v0.1/orders/bids/byItem', {
            itemId: `${resolveRaribleBlockchain(chainId)}:${tokenAddress}:${tokenId}`,
            size,
            continuation: indicator?.id,
        })
        const response = await fetchFromRarible<{
            continuation: string
            orders: RaribleOrder[]
        }>(RaribleURL, requestPath)
        const orders = response.orders.map(
            (order): NonFungibleTokenOrder<ChainId, SchemaType> => ({
                ...createOrder(chainId, order),
                assetPermalink: createRaribleLink(tokenAddress, tokenId),
            }),
        )

        console.log('DEBUG: get offers')
        console.log({
            response,
            orders,
        })

        return createPageable(
            orders,
            createIndicator(indicator),
            orders.length === size ? createNextIndicator(indicator, response.continuation) : undefined,
        )
    }

    async getListings(
        tokenAddress: string,
        tokenId: string,
        { chainId = ChainId.Mainnet, indicator, size = 20 }: HubOptions<ChainId> = {},
    ) {
        const requestPath = urlcat('/v0.1/orders/sell/byItem', {
            itemId: `${resolveRaribleBlockchain(chainId)}:${tokenAddress}:${tokenId}`,
            size,
            continuation: indicator?.id,
        })
        const response = await fetchFromRarible<{
            continuation: string
            orders: RaribleOrder[]
        }>(RaribleURL, requestPath)
        const orders = response.orders.map(
            (order): NonFungibleTokenOrder<ChainId, SchemaType> => ({
                ...createOrder(chainId, order),
                assetPermalink: createRaribleLink(tokenAddress, tokenId),
            }),
        )

        console.log('DEBUG: get listing')
        console.log({
            response: response.orders,
            orders,
        })

        return createPageable(
            orders,
            createIndicator(indicator),
            orders.length === size ? createNextIndicator(indicator, response.continuation) : undefined,
        )
    }

    async getOrders(tokenAddress: string, tokenId: string, side: OrderSide, options: HubOptions<ChainId> = {}) {
        switch (side) {
            case OrderSide.Buy:
                return this.getOffers(tokenAddress, tokenId, options)
            case OrderSide.Sell:
                return this.getListings(tokenAddress, tokenId, options)
            default:
                return createPageable(EMPTY_LIST, createIndicator(options.indicator))
        }
    }

    async getEvents(
        tokenAddress: string,
        tokenId: string,
        { chainId = ChainId.Mainnet, indicator, size = 20 }: HubOptions<ChainId> = {},
    ) {
        const requestPath = urlcat('/v0.1/activities/byItem', {
            type: [RaribleEventType.TRANSFER, RaribleEventType.MINT, RaribleEventType.BID, RaribleEventType.LIST],
            itemId: `${resolveRaribleBlockchain(chainId)}:${tokenAddress}:${tokenId}`,
            cursor: indicator?.id,
            blockchains: [resolveRaribleBlockchain(chainId)],
            size,
            sort: 'LATEST_FIRST',
        })
        const response = await fetchFromRarible<{
            total: number
            cursor: string
            activities: RaribleHistory[]
        }>(RaribleURL, requestPath)

        const events = response.activities.map((history) => createEvent(chainId, history))

        return createPageable(
            events,
            createIndicator(indicator),
            events.length === size ? createNextIndicator(indicator, response.cursor) : undefined,
        )
    }
}
