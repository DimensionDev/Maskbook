import { OpenSeaAccountURL, OPENSEA_API_KEY, OpenSea_API_URL } from './constants'
import type { OpenSeaAssetContract, OpenSeaAssetEvent, OpenSeaResponse, OpenSeaCollection } from './types'
import urlcat from 'urlcat'
import { head, uniqBy } from 'lodash-unified'
import type { AssetCollection, AssetOrder, NFTAsset, NFTHistory, OrderSide } from '../types'
import { getOrderUnitPrice, getOrderUSDPrice, toTokenDetailed } from '../utils'
import fromUnixTime from 'date-fns/fromUnixTime'

import BigNumber from 'bignumber.js'
import {
    ChainId,
    createERC721Token,
    ERC721ContractDetailed,
    ERC721TokenDetailed,
    EthereumTokenType,
    isSameAddress,
} from '@masknet/web3-shared-evm'
async function fetchAsset(url: string, chainId: ChainId) {
    if (![ChainId.Mainnet, ChainId.Rinkeby].includes(chainId)) return

    const response = await (
        await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'x-api-key': OPENSEA_API_KEY,
            },
        })
    ).json()

    return response
}

export async function getNFTsPaged(from: string, opts: { chainId?: ChainId; page?: number; size?: number }) {
    const { chainId = ChainId.Mainnet, page = 0, size = 50 } = opts

    const asset = await fetchAsset(
        urlcat(`${OpenSea_API_URL}/api/v1/assets?owner=:from&limit=:limit&offset=:offset}`, {
            from,
            offset: opts.page,
            limit: opts.size,
        }),
        chainId,
    )
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
    return {
        address,
        chainId,
        name: assetContract?.name ?? 'Unknown Token',
        symbol: assetContract?.token_symbol ?? 'UNKNOWN',
        baseURI: assetContract?.image_url,
        type: EthereumTokenType.ERC721,
    }
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
            name: asset?.name ?? asset?.asset_contract.name ?? 'unknown name',
            description: asset?.description ?? '',
            mediaUrl: asset?.image_url_original ?? asset?.image_url ?? asset?.image_preview_url ?? '',
            owner: asset?.owner.address ?? '',
        },
        tokenId,
    )
}

async function _getAsset(address: string, tokenId: string, chainId: ChainId) {
    const asset = (await fetchAsset(
        urlcat(`${OpenSea_API_URL}/api/v1/asset/:address/:tokenId`, { address, tokenId }),
        chainId,
    )) as OpenSeaResponse
    return asset
}

export async function getContract(address: string, chainId: ChainId) {
    const assetContract = await fetchAsset(`${OpenSea_API_URL}/api/v1/asset_contract/${address}`, chainId)

    return createERC721ContractDetailedAsset(address, chainId, assetContract)
}

export async function getNFT(address: string, tokenId: string, chainId: ChainId) {
    const asset = await _getAsset(address, tokenId, chainId)
    return createERC721TokenAsset(address, tokenId, chainId, asset)
}

export async function getNFTs(from: string, chainId: ChainId) {
    let tokens: ERC721TokenDetailed[] = []
    let page = 0
    let assets
    const size = 50
    do {
        assets = await getNFTsPaged(from, { chainId, page, size })
        tokens = tokens.concat(assets)
        page = page + 1
    } while (assets.length === size)

    return tokens
}

export async function getContractBalance(address: string, contractAddress: string, chainId: ChainId) {
    const assets = await getNFTs(address, chainId)

    return assets.filter((x) => isSameAddress(x.contractDetailed.address, contractAddress)).length
}

function createNFTAsset(asset: OpenSeaResponse, chainId: ChainId) {
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
        isAuction: Date.parse(`${asset.endTime ?? ''}Z`) > Date.now(),
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
            link: `${OpenSeaAccountURL}${asset.owner?.user?.username ?? asset.owner.address ?? ''}`,
        },
        creator: {
            ...asset.creator,
            link: `${OpenSeaAccountURL}${asset.creator?.user?.username ?? asset.creator?.address ?? ''}`,
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
            ? fromUnixTime(Number.parseInt(desktopOrder.listing_time as unknown as string, 10))
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
        top_ownerships: asset.top_ownerships.map((x) => ({ owner: x.owner })),
        collection: asset.collection as unknown as AssetCollection,
        response_: asset as any,
    } as NFTAsset
}

export async function getAsset(address: string, tokenId: string, chainId: ChainId) {
    const asset = await _getAsset(address, tokenId, chainId)
    if (!asset) return

    return createNFTAsset(asset, chainId)
}

export async function getHistory(address: string, tokenId: string, chainId: ChainId) {
    const fetchResponse = await (
        await fetch(
            urlcat(
                `${OpenSea_API_URL}/api/v1/events?asset_contract_address=:address&token_id=:tokenId&offset=0&limit=100`,
                {
                    address,
                    tokenId,
                },
            ),
            {
                mode: 'cors',
                headers: {
                    'x-api-key': OPENSEA_API_KEY,
                },
            },
        )
    ).json()

    const { asset_events }: { asset_events: OpenSeaAssetEvent[] } = fetchResponse

    return asset_events.map((event) => createNFTHistory(event))
}

function createNFTHistory(event: OpenSeaAssetEvent): NFTHistory {
    const accountPair =
        event.event_type === 'successful'
            ? {
                  from: {
                      username: event.seller?.user?.username,
                      address: event.seller?.address,
                      imageUrl: event.seller?.profile_img_url,
                      link: `${OpenSeaAccountURL}${event.seller?.user?.username ?? event.seller?.address}`,
                  },
                  to: {
                      username: event.winner_account?.user?.username,
                      address: event.winner_account?.address,
                      imageUrl: event.winner_account?.profile_img_url,
                      link: `${OpenSeaAccountURL}${
                          event.winner_account?.user?.username ?? event.winner_account?.address
                      }`,
                  },
              }
            : {
                  from: {
                      username: event.from_account?.user?.username,
                      address: event.from_account?.address,
                      imageUrl: event.from_account?.profile_img_url,
                      link: `${OpenSeaAccountURL}${event.from_account?.user?.username ?? event.from_account?.address}`,
                  },
                  to: {
                      username: event.to_account?.user?.username,
                      address: event.to_account?.address,
                      imageUrl: event.to_account?.profile_img_url,
                      link: `${OpenSeaAccountURL}${event.to_account?.user?.username ?? event.to_account?.address}`,
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
    } as NFTHistory
}

export async function getListings(address: string, tokenId: string, chainId: ChainId) {
    return []
}

async function fetchOrder(
    address: string,
    tokenId: string,
    side: number,
    page: number,
    size: number,
    chainId: ChainId,
) {
    const response = await fetch(
        urlcat(
            `${OpenSea_API_URL}/wyvern/v1/orders?asset_contract_address=:address&token_id=:tokenId&side=:side&offset=:offset&limit=:limit`,
            {
                address,
                tokenId,
                size,
                offset: page,
                limit: size,
            },
        ),
        {
            method: 'GET',
            mode: 'cors',
            headers: {
                Accept: 'application/json',
                'x-api-key': OPENSEA_API_KEY,
            },
        },
    )

    if (!response.ok) return []
    const { orders = [] }: { orders: AssetOrder[] } = await response.json()
    return orders
}

export async function getOrder(address: string, tokenId: string, side: OrderSide, chainId: ChainId) {
    let orders: AssetOrder[] = []

    let page = 0
    const size = 50
    let order
    do {
        order = await fetchOrder(address, tokenId, side, page, size, chainId)
        if (order.length === 0) break
        orders = orders.concat(order ?? [])
        page = page + 1
    } while (order.length === size)

    return orders
}

export async function getCollections(address: string, opts: { chainId: ChainId; page?: number; size?: number }) {
    const { collections }: { collections: OpenSeaCollection[] } = await (
        await fetch(
            urlcat(`${OpenSea_API_URL}/api/v1/collections?offset=:offset&limit=:limit`, {
                offset: opts.page,
                limit: opts.size,
            }),
            {
                headers: {
                    'x-api-key': OPENSEA_API_KEY,
                },
            },
        )
    ).json()

    return collections.map((x) => ({
        name: x.name,
        image: x.image_url || undefined,
        slug: x.slug,
    }))
}
