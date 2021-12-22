import {
    ChainId,
    ERC721TokenDetailed,
    EthereumTokenType,
    createERC721Token,
    ERC721ContractDetailed,
    createERC721ContractDetailed,
    createNativeToken,
    createERC20Token,
} from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import fromUnixTime from 'date-fns/fromUnixTime'
import isAfter from 'date-fns/isAfter'
import { head, uniqBy } from 'lodash-unified'
import urlcat from 'urlcat'
import type { NonFungibleTokenAPI } from '../types'
import { getOrderUnitPrice, getOrderUSDPrice } from './utils'
import type {
    OpenSeaAssetContract,
    OpenSeaAssetEvent,
    OpenSeaCollection,
    OpenSeaCustomAccount,
    OpenSeaResponse,
} from './types'
import { OPENSEA_ACCOUNT_URL, OPENSEA_API_KEY, OPENSEA_API_URL } from './constants'

async function fetchFromOpenSea<T>(url: string, chainId: ChainId) {
    if (![ChainId.Mainnet, ChainId.Rinkeby].includes(chainId)) return
    try {
        const response = await fetch(urlcat(OPENSEA_API_URL, url), {
            method: 'GET',
            mode: 'cors',
            headers: { 'x-api-key': OPENSEA_API_KEY },
        })
        return response.json() as Promise<T>
    } catch {
        return
    }
}

function createERC721ContractFromAssetContract(
    address: string,
    chainId: ChainId,
    assetContract?: OpenSeaAssetContract,
): ERC721ContractDetailed {
    return createERC721ContractDetailed(chainId, address, assetContract?.name, assetContract?.token_symbol)
}

function createERC721TokenFromAsset(
    address: string,
    tokenId: string,
    chainId: ChainId,
    asset: OpenSeaResponse,
): ERC721TokenDetailed {
    return createERC721Token(
        createERC721ContractFromAssetContract(address, chainId, asset?.asset_contract),
        {
            name: asset?.name ?? asset?.asset_contract.name ?? '',
            description: asset?.description ?? '',
            mediaUrl: asset?.image_url_original ?? asset?.image_url ?? asset?.image_preview_url ?? '',
            owner: asset?.owner.address ?? '',
        },
        tokenId,
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

function createAssetLink(account: OpenSeaCustomAccount | undefined) {
    return urlcat(OPENSEA_ACCOUNT_URL, {
        address: account?.user?.username ?? account?.address,
    })
}

function createNFTAsset(asset: OpenSeaResponse, chainId: ChainId): NonFungibleTokenAPI.Asset {
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
            asset.collection.payment_tokens.map((x) => createTokenDetailed(chainId, x)),
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
    }
}

function createNFTHistory(event: OpenSeaAssetEvent): NonFungibleTokenAPI.History {
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

export class OpenSeaAPI implements NonFungibleTokenAPI.Provider {
    async getAsset(address: string, tokenId: string, { chainId = ChainId.Mainnet }: { chainId?: ChainId } = {}) {
        const requestPath = urlcat('/api/v1/asset/:address/:tokenId', { address, tokenId })
        const response = await fetchFromOpenSea<OpenSeaResponse>(requestPath, chainId)
        if (!response) return
        return createNFTAsset(response, chainId)
    }

    async getContract(address: string, chainId: ChainId) {
        const requestPath = urlcat('/api/v1/asset_contract/:address', { address })
        const assetContract = await fetchFromOpenSea<OpenSeaAssetContract>(requestPath, chainId)
        return createERC721ContractFromAssetContract(address, chainId, assetContract)
    }

    async getToken(address: string, tokenId: string, chainId: ChainId) {
        const requestPath = urlcat('/api/v1/asset/:address/:tokenId', { address, tokenId })
        const response = await fetchFromOpenSea<OpenSeaResponse>(requestPath, chainId)
        if (!response) return
        return createERC721TokenFromAsset(address, tokenId, chainId, response)
    }

    async getTokens(from: string, opts: NonFungibleTokenAPI.Options) {
        const { chainId = ChainId.Mainnet, page = 0, size = 50 } = opts
        const requestPath = urlcat('/api/v1/assets', {
            owner: from,
            offset: page,
            limit: size,
        })
        const response = await fetchFromOpenSea<{ assets: OpenSeaResponse[] }>(requestPath, chainId)
        return (
            response?.assets
                .filter(
                    (x: OpenSeaResponse) =>
                        ['non-fungible', 'semi-fungible'].includes(x.asset_contract.type) ||
                        ['ERC721', 'ERC1155'].includes(x.asset_contract.schema_name),
                )
                .map((asset: OpenSeaResponse) => createERC721TokenFromAsset(from, asset.token_id, chainId, asset)) ?? []
        )
    }

    async getHistory(
        address: string,
        tokenId: string,
        { chainId = ChainId.Mainnet, page, size }: NonFungibleTokenAPI.Options = {},
    ) {
        const requestPath = urlcat(OPENSEA_API_URL, '/api/v1/events', {
            asset_contract_address: address,
            token_id: tokenId,
            offset: page,
            limit: size,
        })
        const response = await fetchFromOpenSea<{
            asset_events: OpenSeaAssetEvent[]
        }>(requestPath, chainId)
        return response?.asset_events.map(createNFTHistory) ?? []
    }

    async getOrders(
        address: string,
        tokenId: string,
        side: NonFungibleTokenAPI.OrderSide,
        { chainId = ChainId.Mainnet, page, size }: NonFungibleTokenAPI.Options = {},
    ) {
        const requestPath = urlcat(OPENSEA_API_URL, '/wyvern/v1/orders', {
            asset_contract_address: address,
            token_id: tokenId,
            side,
            offset: page,
            limit: size,
        })
        const response = await fetchFromOpenSea<{
            orders: NonFungibleTokenAPI.AssetOrder[]
        }>(requestPath, chainId)
        return response?.orders ?? []
    }

    async getCollections(address: string, { chainId = ChainId.Mainnet, page, size }: NonFungibleTokenAPI.Options = {}) {
        const requestPath = urlcat(OPENSEA_API_URL, '/api/v1/collections', {
            address,
            offset: page,
            limit: size,
        })
        const response = await fetchFromOpenSea<{
            collections: OpenSeaCollection[]
        }>(requestPath, chainId)
        return (
            response?.collections.map((x) => ({
                name: x.name,
                image: x.image_url || undefined,
                slug: x.slug,
            })) ?? []
        )
    }
}
