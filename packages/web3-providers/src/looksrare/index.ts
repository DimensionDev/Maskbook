/* eslint-disable no-constant-condition */
import {
    ChainId,
    ERC721TokenDetailed,
    createERC721Token,
    ERC721ContractDetailed,
    createERC721ContractDetailed,
    createNativeToken,
    createERC20Token,
    EthereumTokenType,
} from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
// eslint-disable-next-line no-restricted-imports
import { fromUnixTime, isAfter } from 'date-fns'
import { head, uniqBy } from 'lodash-unified'
import { getOrderUnitPrice, getOrderUSDPrice } from '../opensea/utils'

import type { NonFungibleTokenAPI } from '../types'
import type { LooksRareAssetEvent, LooksRareAssetOrder, LooksRareCollectionContract, LooksRareResponse } from './types'
import { toImage } from './utils'
import urlcat from 'urlcat'
import { LOOKSRARE_API_URL, LOOKSRARE_RINKEBY_API_URL } from './constants'
import { isProxyENV } from '../helpers'

async function fetchLooksRare<T>(url: string, chainId: ChainId) {
    if (![ChainId.Mainnet, ChainId.Rinkeby].includes(chainId)) return

    try {
        const response = await fetch(urlcat(chainId === 1 ? LOOKSRARE_API_URL : LOOKSRARE_RINKEBY_API_URL, url), {
            method: 'GET',
            headers: { Accept: 'application/json' },
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

function createERC721ContractFromAssetContract(
    address: string,
    chainId: ChainId,
    assetContract?: LooksRareCollectionContract,
): ERC721ContractDetailed {
    return createERC721ContractDetailed(
        chainId,
        assetContract?.address ?? '',
        assetContract?.name,
        assetContract?.symbol,
        undefined,
    )
}

function createERC721TokenFromAsset(
    address: string,
    tokenId: string,
    chainId: ChainId,
    asset: LooksRareResponse,
): ERC721TokenDetailed {
    const imageURL = asset?.image_preview_url ?? asset?.image_url ?? ''
    return createERC721Token(
        createERC721ContractFromAssetContract(asset?.asset_contract?.address, chainId),
        {
            name: asset?.name ?? asset?.asset_contract.name ?? '',
            description: asset?.description ?? '',
            imageURL,
            mediaUrl: asset?.animation_url ?? toImage(asset?.image_original_url ?? imageURL),
            owner: asset?.owner.address ?? '',
        },
        tokenId,
        {
            name: asset.collection.name,
            image: asset.collection.image_url || undefined,
            slug: asset.collection.slug,
        },
    )
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

function createNFTAsset(asset: LooksRareResponse, chainId: ChainId): NonFungibleTokenAPI.Asset {
    const desktopOrder = head(
        asset.orders?.sort((a, b) =>
            new BigNumber(getOrderUSDPrice(b.current_price, b.payment_token_contract?.usd_price) ?? 0)
                .minus(getOrderUSDPrice(a.current_price, a.payment_token_contract?.usd_price) ?? 0)
                .toNumber(),
        ),
    )

    return {
        is_verified: ['approved', 'verified'].includes(asset.collection?.safelist_request_status ?? ''),
        // it's an IOS string as my inspection
        is_auction: isAfter(Date.parse(`${asset.endTime ?? ''}Z`), Date.now()),
        image_url: asset.animation_url ?? asset.image_original_url ?? asset.image_url ?? asset.image_preview_url ?? '',
        asset_contract: {
            name: asset.asset_contract.name,
            description: asset.asset_contract.description,
            schemaName: asset.asset_contract.schema_name,
        },
        current_price: desktopOrder
            ? new BigNumber(
                  getOrderUnitPrice(
                      desktopOrder.current_price,
                      desktopOrder.payment_token_contract?.decimals,
                      desktopOrder.quantity,
                  ) ?? 0,
              ).toNumber()
            : null,
        current_symbol: desktopOrder?.payment_token_contract?.symbol ?? 'ETH',
        owner: {
            ...asset.owner,
            link: createAssetLink(asset.owner),
        },
        creator: {
            ...asset.creator,
            link: createAssetLink(asset.creator),
        },
        token_id: asset.token_id,
        token_address: asset.token_address,
        traits: asset.traits,
        safelist_request_status: asset.collection?.safelist_request_status ?? '',
        description: asset.description,
        name: asset.name ?? asset.collection.name,
        collection_name: asset.collection.name,
        animation_url: asset.animation_url,
        end_time: asset.endTime
            ? new Date(asset.endTime)
            : desktopOrder
            ? fromUnixTime(desktopOrder.listing_time)
            : null,
        order_payment_tokens: desktopOrder?.payment_token_contract
            ? [createTokenDetailed(chainId, desktopOrder.payment_token_contract)]
            : [],
        offer_payment_tokens: uniqBy(
            asset.collection.payment_tokens.map(
                (x: { address: string; decimals: number; name: string; symbol: string }) =>
                    createTokenDetailed(chainId, x),
            ),
            (x) => x.address.toLowerCase(),
        ).filter((x) => x.type === EthereumTokenType.ERC20),
        slug: asset.collection.slug,
        desktopOrder,
        top_ownerships: asset.top_ownerships.map((x): { owner: NonFungibleTokenAPI.AssetOwner } => ({
            owner: {
                address: x.owner.address,
                profile_img_url: x.owner.profile_img_url,
                user: { username: x.owner.user?.username ?? '' },
                link: '',
            },
        })),
        collection: asset.collection as unknown as NonFungibleTokenAPI.AssetCollection,
        response_: asset as any,
        last_sale: asset.last_sale,
    }
}

function createNFTHistory(event: LooksRareAssetEvent): NonFungibleTokenAPI.History {
    const accountPair =
        event.event_type === 'successful'
            ? {
                  from: {
                      username: event.seller?.user?.username,
                      address: event.seller?.address,
                      imageUrl: event.seller?.profile_img_url,
                      link: createAssetLink(event.seller),
                  },
                  to: {
                      username: event.winner_account?.user?.username,
                      address: event.winner_account?.address,
                      imageUrl: event.winner_account?.profile_img_url,
                      link: createAssetLink(event.winner_account),
                  },
              }
            : {
                  from: {
                      username: event.from_account?.user?.username,
                      address: event.from_account?.address,
                      imageUrl: event.from_account?.profile_img_url,
                      link: createAssetLink(event.from_account),
                  },
                  to: {
                      username: event.to_account?.user?.username,
                      address: event.to_account?.address,
                      imageUrl: event.to_account?.profile_img_url,
                      link: createAssetLink(event.to_account),
                  },
              }
    return {
        id: event.id,
        accountPair,
        price: {
            quantity: event.quantity,
            asset: event.asset,
            paymentToken: event.payment_token,
            price: event.bid_amount ?? event.ending_price ?? event.starting_price,
        },
        eventType: event.event_type,
        transactionBlockExplorerLink: event.transaction?.blockExplorerLink,
        timestamp: new Date(`${event.created_date}Z`).getTime(),
    }
}

function createAssetOrder(order: LooksRareAssetOrder): NonFungibleTokenAPI.AssetOrder {
    return {
        created_time: order.created_time,
        current_price: order.current_price,
        current_bounty: order.current_bounty,
        maker_account: { ...order.maker, link: '' },
        taker_account: { ...order.taker, link: '' },
        payment_token: order.payment_token,
        payment_token_contract: order.payment_token_contract,
        fee_recipient_account: order.fee_recipient,
        cancelled_or_finalized: order.cancelled || order.finalized,
        marked_invalid: order.marked_invalid,
        approved_on_chain: order.approved_on_chain,
        listing_time: order.listing_time,
        side: order.side,
        quantity: order.quantity,
        expiration_time: order.expiration_time,
        order_hash: order.order_hash,
    }
}

export class LooksRareAPI {
    async getAsset(address: string, tokenId: string, { chainId = ChainId.Mainnet }: { chainId?: ChainId } = {}) {
        const requestPath = urlcat('api/v1/tokens?collection=:address&tokenId=:tokenId', { address, tokenId })
        const response = fetchLooksRare<LooksRareResponse>(requestPath, chainId)
        if (!response) return
        return createNFTAsset(response, chainId)
    }

    async getContract(address: string, chainId: ChainId) {
        const requestPath = urlcat('api/v1/collections?address=:address', { address })
        const assetContract = await fetchLooksRare<LooksRareCollectionContract>(requestPath, chainId)
        return createERC721ContractFromAssetContract(address, chainId, assetContract)
    }

    async getToken(address: string, tokenId: string, chainId: ChainId) {
        const requestPath = urlcat('api/v1/tokens?collection=:address&tokenId=:tokenId', { address, tokenId })
        const response = await fetchLooksRare<LooksRareResponse>(requestPath, chainId)
        if (!response) return
        return createERC721TokenFromAsset(address, tokenId, chainId, response)
    }

    async getHistory(
        address: string,
        tokenId: string,
        { chainId = ChainId.Mainnet, page, size, first, cursor }: NonFungibleTokenAPI.Options = {},
    ) {
        const requestPath = urlcat('/api/v1/events', {
            collection_address: address,
            token_id: tokenId,
            cursor: page,
            first: size,
        })
        const response = await fetchLooksRare<{
            asset_events: LooksRareAssetEvent[]
        }>(requestPath, chainId)
        return response?.asset_events?.map(createNFTHistory) ?? []
    }

    async getOrders(
        address: string,
        tokenId: string,
        side: NonFungibleTokenAPI.OrderSide,
        { chainId = ChainId.Mainnet, page, size }: NonFungibleTokenAPI.Options = {},
    ) {
        const requestPath = urlcat('/api/v1/orders', {
            collection_address: address,
            token_id: tokenId,
            side,
            offset: page,
            limit: size,
        })
        const response = await fetchLooksRare<{
            orders: LooksRareAssetOrder[]
        }>(requestPath, chainId)
        return response?.orders?.map(createAssetOrder) ?? []
    }
}
function createAssetLink(owner: any): string {
    throw new Error('Function not implemented.')
}
