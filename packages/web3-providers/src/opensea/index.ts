import {
    ChainId,
    createERC721ContractDetailed,
    createERC721Token,
    ERC721ContractDetailed,
    ERC721TokenDetailed,
    EthereumTokenType,
} from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import fromUnixTime from 'date-fns/fromUnixTime'
import isAfter from 'date-fns/isAfter'
import { head, uniqBy } from 'lodash-unified'
import urlcat from 'urlcat'
import type { AssetCollection, AssetOrder, NFTAsset, NFTAssetOwner, NFTHistory, OrderSide } from '../types'
import { getOrderUnitPrice, getOrderUSDPrice, toTokenDetailed } from './utils'
import type {
    OpenSeaAssetContract,
    OpenSeaAssetEvent,
    OpenSeaCollection,
    OpenSeaCustomAccount,
    OpenSeaResponse,
} from './types'

const OPENSEA_ACCOUNT_URL = 'https://opensea.io/accounts/:address'
const OPENSEA_API_KEY = 'c38fe2446ee34f919436c32db480a2e3'
const OPENSEA_API_URL = 'https://api.opensea.io'

async function fetchAsset<T>(url: string, chainId: ChainId) {
    if (![ChainId.Mainnet, ChainId.Rinkeby].includes(chainId)) return
    const response = await fetch(urlcat(OPENSEA_API_URL, url), {
        method: 'GET',
        mode: 'cors',
        headers: { 'x-api-key': OPENSEA_API_KEY },
    })
    return response.json() as Promise<T>
}

export async function getNFTsByPagination(from: string, opts: { chainId?: ChainId; page?: number; size?: number }) {
    const { chainId = ChainId.Mainnet, page = 0, size = 50 } = opts
    const requestPath = urlcat('/api/v1/assets', {
        owner: from,
        offset: page,
        limit: size,
    })
    const asset = await fetchAsset<{ assets: OpenSeaResponse[] }>(requestPath, chainId)
    if (!asset) return []

    return asset.assets
        .filter(
            (x: OpenSeaResponse) =>
                ['non-fungible', 'semi-fungible'].includes(x.asset_contract.type) ||
                ['ERC721', 'ERC1155'].includes(x.asset_contract.schema_name),
        )
        .map((asset: OpenSeaResponse) => createERC721TokenAsset(from, asset.token_id, chainId, asset))
}

function createERC721ContractDetailedAsset(
    address: string,
    chainId: ChainId,
    assetContract?: OpenSeaAssetContract,
): ERC721ContractDetailed {
    return createERC721ContractDetailed(chainId, address, assetContract?.name, assetContract?.token_symbol)
}

function createERC721TokenAsset(
    address: string,
    tokenId: string,
    chainId: ChainId,
    asset?: OpenSeaResponse,
): ERC721TokenDetailed {
    return createERC721Token(
        createERC721ContractDetailedAsset(address, chainId, asset?.asset_contract),
        {
            name: asset?.name ?? asset?.asset_contract.name ?? '',
            description: asset?.description ?? '',
            mediaUrl: asset?.image_url_original ?? asset?.image_url ?? asset?.image_preview_url ?? '',
            owner: asset?.owner.address ?? '',
        },
        tokenId,
    )
}

async function _getAsset(address: string, tokenId: string, chainId: ChainId) {
    const requestPath = urlcat('/api/v1/asset/:address/:tokenId', { address, tokenId })
    return fetchAsset<OpenSeaResponse>(requestPath, chainId)
}

export async function getContract(address: string, chainId: ChainId) {
    const requestPath = urlcat('/api/v1/asset_contract/:address', { address })
    const assetContract = await fetchAsset<OpenSeaAssetContract>(requestPath, chainId)
    return createERC721ContractDetailedAsset(address, chainId, assetContract)
}

export async function getNFT(address: string, tokenId: string, chainId: ChainId) {
    const asset = await _getAsset(address, tokenId, chainId)
    return createERC721TokenAsset(address, tokenId, chainId, asset)
}

function createNFTAsset(asset: OpenSeaResponse, chainId: ChainId): NFTAsset {
    const desktopOrder = head(
        asset.sell_orders?.sort((a, b) =>
            new BigNumber(getOrderUSDPrice(a.current_price, a.payment_token_contract?.usd_price) ?? 0)
                .minus(getOrderUSDPrice(a.current_price, a.payment_token_contract?.usd_price) ?? 0)
                .toNumber(),
        ),
    )

    return {
        is_verified: ['approved', 'verified'].includes(asset.collection?.safelist_request_status ?? ''),
        // it's an IOS string as my inspection
        is_auction: isAfter(Date.parse(`${asset.endTime ?? ''}Z`), Date.now()),
        image_url: asset.image_url_original ?? asset.image_url ?? asset.image_preview_url ?? '',
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
            link: makeAssetLink(asset.owner),
        },
        creator: {
            ...asset.creator,
            link: makeAssetLink(asset.creator),
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
            ? [toTokenDetailed(chainId, desktopOrder.payment_token_contract)]
            : [],
        offer_payment_tokens: uniqBy(
            asset.collection.payment_tokens.map((x) => toTokenDetailed(chainId, x)),
            (x) => x.address.toLowerCase(),
        ).filter((x) => x.type === EthereumTokenType.ERC20),
        slug: asset.collection.slug,
        desktopOrder,
        top_ownerships: asset.top_ownerships.map((x): { owner: NFTAssetOwner } => ({
            owner: {
                address: x.owner.address,
                profile_img_url: x.owner.profile_img_url,
                user: { username: x.owner.user?.username ?? '' },
                link: '',
            },
        })),
        collection: asset.collection as unknown as AssetCollection,
        response_: asset as any,
    }
}

export async function getAsset(address: string, tokenId: string, chainId: ChainId) {
    const asset = await _getAsset(address, tokenId, chainId)
    if (!asset) return

    return createNFTAsset(asset, chainId)
}

export async function getHistory(address: string, tokenId: string, chainId: ChainId, page: number, size: number) {
    const requestPath = urlcat(OPENSEA_API_URL, '/api/v1/events', {
        asset_contract_address: address,
        token_id: tokenId,
        offset: page,
        limit: size,
    })
    const response = await fetch(requestPath, {
        mode: 'cors',
        headers: { 'x-api-key': OPENSEA_API_KEY },
    })
    interface Payload {
        asset_events: OpenSeaAssetEvent[]
    }
    const { asset_events }: Payload = await response.json()
    return asset_events.map(createNFTHistory)
}

function createNFTHistory(event: OpenSeaAssetEvent): NFTHistory {
    const accountPair =
        event.event_type === 'successful'
            ? {
                  from: {
                      username: event.seller?.user?.username,
                      address: event.seller?.address,
                      imageUrl: event.seller?.profile_img_url,
                      link: makeAssetLink(event.seller),
                  },
                  to: {
                      username: event.winner_account?.user?.username,
                      address: event.winner_account?.address,
                      imageUrl: event.winner_account?.profile_img_url,
                      link: makeAssetLink(event.winner_account),
                  },
              }
            : {
                  from: {
                      username: event.from_account?.user?.username,
                      address: event.from_account?.address,
                      imageUrl: event.from_account?.profile_img_url,
                      link: makeAssetLink(event.from_account),
                  },
                  to: {
                      username: event.to_account?.user?.username,
                      address: event.to_account?.address,
                      imageUrl: event.to_account?.profile_img_url,
                      link: makeAssetLink(event.to_account),
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

export async function getListings(address: string, tokenId: string, chainId: ChainId) {
    return []
}

async function fetchOrders(
    chainId: ChainId,
    address: string,
    tokenId: string,
    side: number,
    page: number,
    size: number,
) {
    const requestPath = urlcat(OPENSEA_API_URL, '/wyvern/v1/orders', {
        asset_contract_address: address,
        token_id: tokenId,
        side,
        offset: page,
        limit: size,
    })
    const response = await fetch(requestPath, {
        method: 'GET',
        mode: 'cors',
        headers: { Accept: 'application/json', 'x-api-key': OPENSEA_API_KEY },
    })
    if (!response.ok) return []
    interface Payload {
        orders: AssetOrder[]
    }
    const payload: Payload = await response.json()
    return payload.orders ?? []
}

export async function getOrders(
    address: string,
    tokenId: string,
    side: OrderSide,
    chainId: ChainId,
    page: number,
    size: number,
) {
    return fetchOrders(chainId, address, tokenId, side, page, size)
}

export async function getCollections(address: string, opts: { chainId: ChainId; page?: number; size?: number }) {
    const requestPath = urlcat(OPENSEA_API_URL, '/api/v1/collections', {
        address,
        offset: opts.page,
        limit: opts.size,
    })
    const response = await fetch(requestPath, { headers: { 'x-api-key': OPENSEA_API_KEY } })
    interface Payload {
        collections: OpenSeaCollection[]
    }
    const { collections }: Payload = await response.json()
    return collections.map((x) => ({
        name: x.name,
        image: x.image_url || undefined,
        slug: x.slug,
    }))
}

function makeAssetLink(account: OpenSeaCustomAccount | undefined) {
    return urlcat(OPENSEA_ACCOUNT_URL, {
        address: account?.user?.username ?? account?.address,
    })
}
