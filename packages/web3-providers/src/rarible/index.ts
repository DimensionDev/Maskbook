import {
    Ownership,
    RaribleCollectibleResponse,
    RaribleEventType,
    RaribleHistory,
    RaribleNFTItemMapResponse,
    RaribleOfferResponse,
    RaribleProfileResponse,
} from './types'
import {
    ChainId,
    createLookupTableResolver,
    ERC721TokenDetailed,
    EthereumTokenType,
    FungibleTokenDetailed,
} from '@masknet/web3-shared-evm'
import { RaribleUserURL, RaribleRopstenUserURL, RaribleMainnetURL } from './constants'
import urlcat from 'urlcat'
import { AssetOrder, NFTAsset, NFTHistory, OrderSide } from '../types'
import { compact, first } from 'lodash-unified'
import { toRaribleImage } from './helpers'

export const resolveRaribleUserNetwork = createLookupTableResolver<ChainId.Mainnet | ChainId.Ropsten, string>(
    {
        [ChainId.Mainnet]: RaribleUserURL,
        [ChainId.Ropsten]: RaribleRopstenUserURL,
    },
    RaribleUserURL,
)

export async function fetchFromRarible<T>(path: string, init?: RequestInit) {
    const response = await fetch(urlcat(RaribleMainnetURL, path), {
        mode: 'cors',
        ...init,
    })

    return response.json() as Promise<T>
}

export async function getProfilesFromRarible(addresses: (string | undefined)[]) {
    return fetchFromRarible<RaribleProfileResponse[]>('/profiles/list', {
        method: 'POST',
        body: JSON.stringify(addresses),
        headers: {
            'content-type': 'application/json',
        },
    })
}

export async function getOffers(tokenAddress: string, tokenId: string, chainId: ChainId): Promise<AssetOrder[]> {
    const requestPath = urlcat('/items/:tokenAddress::tokenId/offers', { tokenAddress, tokenId })
    const orders = await fetchFromRarible<RaribleOfferResponse[]>(requestPath, {
        method: 'POST',
        body: JSON.stringify({ size: 20 }),
        headers: { 'content-type': 'application/json' },
    })
    const profiles = await getProfilesFromRarible(orders.map((item) => item.maker))
    return orders.map((order): AssetOrder => {
        const ownerInfo = profiles.find((owner) => owner.id === order.maker)
        return {
            created_time: order.updateDate,
            current_price: order.buyPriceEth,
            current_bounty: order.fee,
            payment_token: order.token,
            listing_time: 0,
            side: OrderSide.Buy,
            quantity: '1',
            expiration_time: 0,
            order_hash: order.signature,
            approved_on_chain: false,
            maker_account: {
                user: { username: ownerInfo?.name ?? '' },
                address: ownerInfo?.id ?? '',
                profile_img_url: toRaribleImage(ownerInfo?.image),
                link: `${resolveRaribleUserNetwork(chainId as number)}${ownerInfo?.id ?? ''}`,
            },
        }
    })
}

export async function getListings(tokenAddress: string, tokenId: string, chainId: ChainId): Promise<AssetOrder[]> {
    const requestPath = urlcat('/items/:tokenAddress::tokenId/ownerships', { tokenAddress, tokenId })
    const assets = await fetchFromRarible<Ownership[]>(requestPath)
    const listings = assets.filter((x) => x.selling)
    const profiles = await getProfilesFromRarible(listings.map((x) => x.owner))
    return listings.map((asset): AssetOrder => {
        const ownerInfo = profiles.find((owner) => owner.id === asset.owner)
        return {
            created_time: asset.date,
            approved_on_chain: false,
            current_price: asset.priceEth,
            payment_token: asset.token,
            listing_time: 0,
            side: OrderSide.Buy,
            quantity: '1',
            expiration_time: 0,
            order_hash: asset.signature,
            maker_account: {
                user: { username: ownerInfo?.name ?? '' },
                address: ownerInfo?.id ?? '',
                profile_img_url: toRaribleImage(ownerInfo?.image),
                link: `${resolveRaribleUserNetwork(chainId as number)}${ownerInfo?.id ?? ''}`,
            },
        }
    })
}

export async function getOrders(tokenAddress: string, tokenId: string, side: OrderSide, chainId: ChainId) {
    switch (side) {
        case OrderSide.Buy:
            return getOffers(tokenAddress, tokenId, chainId)
        case OrderSide.Sell:
            return getListings(tokenAddress, tokenId, chainId)
        default:
            return []
    }
}

export async function getHistory(tokenAddress: string, tokenId: string): Promise<NFTHistory[]> {
    let histories = await fetchFromRarible<RaribleHistory[]>(`/activity`, {
        method: 'POST',
        body: JSON.stringify({
            // types: ['BID', 'BURN', 'BUY', 'CANCEL', 'CANCEL_BID', 'ORDER', 'MINT', 'TRANSFER', 'SALE'],
            filter: {
                '@type': 'by_item',
                address: tokenAddress,
                tokenId,
            },
            size: 100,
        }),
        headers: {
            'content-type': 'application/json',
        },
    })

    if (histories.length) {
        histories = histories.filter((x) => Object.values(RaribleEventType).includes(x['@type']))
    }

    const profiles = await getProfilesFromRarible(
        compact([
            ...histories.map((history) => history.owner),
            ...histories.map((history) => history.buyer),
            ...histories.map((history) => history.from),
        ]),
    )

    return histories.map((history) => {
        const ownerInfo = profiles.find((profile) => profile.id === history.owner)
        const fromInfo = profiles.find((profile) => profile.id === history.buyer || profile.id === history.from)
        return {
            id: history.id,
            eventType: history['@type'],
            timestamp: history.date.getTime() ?? 0,
            price: {
                quantity: '1',
                price: history.price,
                asset: {
                    id: fromInfo?.id,
                    decimals: 0,
                    image_url: fromInfo?.image,
                    image_original_url: '',
                    image_preview_url: '',
                    asset_contract: {
                        symbol: fromInfo?.type,
                    },
                    permalink: '',
                },
            },
            accountPair: {
                from: {
                    username: fromInfo?.name,
                    address: fromInfo?.id,
                    imageUrl: fromInfo?.image,
                    link: '',
                },
                to: {
                    username: ownerInfo?.name,
                    address: ownerInfo?.id,
                    imageUrl: ownerInfo?.image,
                    link: '',
                },
            },
        } as NFTHistory
    })
}

function createERC721TokenAsset(
    tokenAddress: string,
    tokenId: string,
    asset?: RaribleNFTItemMapResponse,
): ERC721TokenDetailed {
    return {
        contractDetailed: {
            type: EthereumTokenType.ERC721,
            chainId: ChainId.Mainnet,
            address: tokenAddress,
            name: asset?.meta.name ?? '',
            symbol: '',
        },
        info: {
            name: asset?.meta.name ?? '',
            description: asset?.meta.description ?? '',
            mediaUrl: toRaribleImage(asset?.meta.image.url.ORIGINAL ?? asset?.meta.image.url.PREVIEW ?? ''),
            owner: asset?.owners[0],
        },
        tokenId: tokenId,
    }
}

function createNFTAsset(asset: RaribleNFTItemMapResponse, chainId: ChainId): NFTAsset {
    const owner = first(asset?.owners)
    const creator = first(asset?.creators)
    return {
        is_verified: false,
        is_auction: false,
        token_address: asset.contract,
        image_url: toRaribleImage(asset?.meta.image.url.ORIGINAL),
        asset_contract: null,
        owner: owner
            ? {
                  address: owner,
                  profile_img_url: '',
                  user: { username: owner },
                  link: '',
              }
            : null,
        creator: creator
            ? {
                  address: creator.account,
                  profile_img_url: '',
                  user: { username: creator.account },
                  link: '',
              }
            : null,
        traits: asset?.meta.attributes.map(({ key, value }) => ({ trait_type: key, value })),
        description: asset?.meta.description ?? '',
        name: asset?.meta.name ?? 'Unknown',
        collection_name: '',
        animation_url: asset.meta.animation?.url.PREVIEW,
        current_price: 0,
        current_symbol: 'ETH',
        end_time: null,
        order_payment_tokens: [] as FungibleTokenDetailed[],
        offer_payment_tokens: [] as FungibleTokenDetailed[],
        top_ownerships: owner
            ? [
                  {
                      owner: {
                          address: owner,
                          profile_img_url: '',
                          user: { username: owner },
                          link: '',
                      },
                  },
              ]
            : [],
        slug: '',
        response_: asset,
        token_id: asset.tokenId,
        safelist_request_status: '',
    }
}

async function _getAsset(address: string, tokenId: string) {
    const requestPath = urlcat('/v0.1/nft/items/:address::tokenId', {
        includeMeta: true,
        address,
        tokenId,
    })
    const assetResponse = await fetchFromRarible<RaribleNFTItemMapResponse>(requestPath, {
        method: 'GET',
        mode: 'cors',
        headers: { 'content-type': 'application/json' },
    })
    return assetResponse
}

export async function getAsset(address: string, tokenId: string, chainId: ChainId) {
    const asset = await _getAsset(address, tokenId)
    if (!asset) return

    return createNFTAsset(asset, chainId)
}

export async function getNFT(tokenAddress: string, tokenId: string) {
    const asset = await _getAsset(tokenAddress, tokenId)
    return createERC721TokenAsset(tokenAddress, tokenId, asset)
}

export async function getNFTsByPagination(
    from: string,
    opts: { chainId: ChainId; page?: number; size?: number },
): Promise<ERC721TokenDetailed[]> {
    const requestPath = urlcat('/ethereum/nft/items/byOwner', { owner: from, size: opts.size })
    interface Payload {
        total: number
        continuation: string
        items: RaribleNFTItemMapResponse[]
    }
    const asset = await fetchFromRarible<Payload>(requestPath)
    if (!asset) return []
    return asset.items.map((asset) => createERC721TokenAsset(asset.contract, asset.tokenId, asset))
}

export async function getCollections(address: string, opts: { chainId: ChainId; page?: number; size?: number }) {
    const requestPath = urlcat('/collections/:address', { address })
    const response = await fetchFromRarible<RaribleCollectibleResponse>(requestPath, {
        method: 'POST',
        body: JSON.stringify({ size: 20 }),
        headers: { 'content-type': 'application/json' },
    })
    return [response]
}
