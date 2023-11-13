import urlcat from 'urlcat'
import { first, last } from 'lodash-es'
import {
    OrderSide,
    type NonFungibleTokenOrder,
    type NonFungibleTokenEvent,
    type NonFungibleTokenContract,
    SourceType,
} from '@masknet/web3-shared-base'
import { createPageable, createIndicator, createNextIndicator, EMPTY_LIST } from '@masknet/shared-base'
import { ChainId, createERC20Token, isZeroAddress, SchemaType } from '@masknet/web3-shared-evm'
import { EVMChainResolver } from '../Web3/EVM/apis/ResolverAPI.js'
import { X2Y2_API_URL, X2Y2_PAGE_SIZE } from './constants.js'
import type { Contract, Event, Order } from './types.js'
import { resolveActivityType } from '../helpers/resolveActivityType.js'
import { fetchSquashedJSON } from '../helpers/fetchJSON.js'
import type { BaseHubOptions, NonFungibleTokenAPI } from '../entry-types.js'

async function fetchFromX2Y2<T>(pathname: string) {
    const response = await fetchSquashedJSON<
        | {
              success: boolean
              next?: string
              data?: T | null
          }
        | undefined
    >(urlcat(X2Y2_API_URL, pathname))
    // The `undefined` can be given a default value when deconstructed, but `null` can't.
    return response?.success ? ([response.data ?? undefined, response.next] as const) : EMPTY_LIST
}

class X2Y2API implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    createPermalink(address: string, tokenId: string) {
        return urlcat('https://x2y2.io/eth/:contract/:tokenId', {
            contract: address,
            tokenId,
        })
    }
    createOrder(address: string, tokenId: string, order: Order): NonFungibleTokenOrder<ChainId, SchemaType> {
        return {
            id: order.item_hash,
            chainId: ChainId.Mainnet,
            assetPermalink: this.createPermalink(address, tokenId),
            quantity: '1',
            hash: order.item_hash,
            side: order.type === 'buy' ? OrderSide.Buy : OrderSide.Sell,
            maker:
                order.maker ?
                    {
                        address: order.maker,
                    }
                :   undefined,
            taker:
                order.taker ?
                    {
                        address: order.taker,
                    }
                :   undefined,
            createdAt: Number.parseInt(order.created_at, 10),
            expiredAt: Number.parseInt(order.end_at, 10),
            priceInToken: {
                amount: order.price,
                token:
                    isZeroAddress(order.currency) ?
                        EVMChainResolver.nativeCurrency(ChainId.Mainnet)
                    :   createERC20Token(ChainId.Mainnet, order.currency),
            },
            source: SourceType.X2Y2,
        }
    }

    createEvent(address: string, tokenId: string, event: Event): NonFungibleTokenEvent<ChainId, SchemaType> {
        return {
            id: event.id.toString(),
            chainId: ChainId.Mainnet,
            type: resolveActivityType(event.type),
            assetPermalink: this.createPermalink(address, tokenId),
            quantity: '1',
            hash: event.order.item_hash,
            from: {
                address: event.from_address,
            },
            to: {
                address: event.to_address,
            },
            timestamp: Number.parseInt(event.created_at, 10) * 1000,
            paymentToken:
                isZeroAddress(event.order.currency) ?
                    EVMChainResolver.nativeCurrency(ChainId.Mainnet)
                :   createERC20Token(ChainId.Mainnet, event.order.currency),
            source: SourceType.X2Y2,
        }
    }

    createContract(address: string, contract: Contract): NonFungibleTokenContract<ChainId, SchemaType> {
        return {
            chainId: ChainId.Mainnet,
            name: contract.name,
            symbol: contract.symbol,
            address,
            schema: contract.erc_type === 721 ? SchemaType.ERC721 : SchemaType.ERC1155,
        }
    }

    async getOrders(address: string, tokenId: string, side: OrderSide, options?: BaseHubOptions<ChainId>) {
        const [data = EMPTY_LIST, next] = await fetchFromX2Y2<Order[]>(
            urlcat('/v1/orders', {
                cursor: options?.indicator?.id,
                contract: address,
                token_id: tokenId,
                sort: 'created_at',
                direction: 'desc',
                limit: X2Y2_PAGE_SIZE,
            }),
        )

        const orders = data
            .filter(
                (x) => (x.type === 'sell' && side === OrderSide.Sell) || (x.type === 'buy' && side === OrderSide.Buy),
            )
            .map((x) => this.createOrder(address, tokenId, x))

        return createPageable(
            orders,
            createIndicator(options?.indicator),
            orders.length && next ? createNextIndicator(options?.indicator, next) : undefined,
        )
    }
    async getEvents(address: string, tokenId: string, options?: BaseHubOptions<ChainId>) {
        const cursors = options?.indicator?.id?.split('_')
        const listCursor = first(cursors)
        const saleCursor = last(cursors)

        const result = await Promise.all([
            listCursor || !options?.indicator?.index ?
                fetchFromX2Y2<Event[]>(
                    urlcat('/v1/events', {
                        cursor: listCursor ?? '',
                        contract: address,
                        token_id: tokenId,
                        // list, sale, cancel_listing
                        type: 'list',
                    }),
                )
            :   EMPTY_LIST,
            saleCursor || !options?.indicator?.index ?
                fetchFromX2Y2<Event[]>(
                    urlcat('/v1/events', {
                        cursor: saleCursor ?? '',
                        contract: address,
                        token_id: tokenId,
                        // list, sale, cancel_listing
                        type: 'sale',
                    }),
                )
            :   EMPTY_LIST,
        ])

        const [[listData = EMPTY_LIST, listNext], [saleData = EMPTY_LIST, saleNext]] = result
        const data = [...listData, ...saleData]

        const next = `${listNext}_${saleNext}`
        const events = data.map((x) => this.createEvent(address, tokenId, x))

        return createPageable(
            events,
            createIndicator(options?.indicator),
            events.length && next ? createNextIndicator(options?.indicator, next) : undefined,
        )
    }
    async getContract(address: string) {
        const [contract] = await fetchFromX2Y2<Contract>(
            urlcat('/v1/contracts/:contract', {
                contract: address,
            }),
        )
        if (!contract) return
        return this.createContract(address, contract)
    }
}
export const X2Y2 = new X2Y2API()
