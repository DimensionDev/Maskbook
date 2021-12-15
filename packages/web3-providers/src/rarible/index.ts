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
    isSameAddress,
} from '@masknet/web3-shared-evm'
import {
    RaribleUserURL,
    RaribleRopstenUserURL,
    RaribleMainnetURL,
    RaribleMainnetAPI_URL,
    RaribleChainURL,
} from './constants'
import urlcat from 'urlcat'
import { AssetOrder, NFTAsset, NFTAssetOwner, NFTHistory, OrderSide } from '../types'
import { compact, first } from 'lodash-unified'
import { toRaribleImage } from './helpers'

export const resolveRaribleUserNetwork = createLookupTableResolver<ChainId.Mainnet | ChainId.Ropsten, string>(
    {
        [ChainId.Mainnet]: RaribleUserURL,
        [ChainId.Ropsten]: RaribleRopstenUserURL,
    },
    RaribleUserURL,
)

export async function fetchFromRarible<T>(root: string, subPath: string, config = {} as RequestInit) {
    const response = await (
        await fetch(urlcat(root, subPath), {
            mode: 'cors',
            ...config,
        })
    ).json()

    return response as T
}

export async function getProfilesFromRarible(addresses: (string | undefined)[]) {
    return fetchFromRarible<RaribleProfileResponse[]>(RaribleMainnetURL, 'profiles/list', {
        method: 'POST',
        body: JSON.stringify(addresses),
        headers: {
            'content-type': 'application/json',
        },
    })
}

export async function getOffers(tokenAddress: string, tokenId: string, chainId: ChainId): Promise<AssetOrder[]> {
    const orders = await fetchFromRarible<RaribleOfferResponse[]>(
        RaribleMainnetURL,
        `items/${tokenAddress}:${tokenId}/offers`,
        {
            method: 'POST',
            body: JSON.stringify({ size: 20 }),
            headers: {
                'content-type': 'application/json',
            },
        },
    )
    const profiles = await getProfilesFromRarible(orders.map((item) => item.maker))
    return orders.map((order) => {
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
                user: {
                    username: ownerInfo?.name ?? '',
                },
                address: ownerInfo?.id ?? '',
                profile_img_url: toRaribleImage(ownerInfo?.image),
                link: `${resolveRaribleUserNetwork(chainId as number)}${ownerInfo?.id ?? ''}`,
            } as NFTAssetOwner,
        } as AssetOrder
    })
}

export async function getListings(tokenAddress: string, tokenId: string, chainId: ChainId): Promise<AssetOrder[]> {
    const assets = await fetchFromRarible<Ownership[]>(RaribleMainnetURL, `items/${tokenAddress}:${tokenId}/ownerships`)
    const listings = assets.filter((x) => x.selling)
    const profiles = await getProfilesFromRarible(listings.map((x) => x.owner))
    return listings.map((asset) => {
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
                user: {
                    username: ownerInfo?.name ?? '',
                },
                address: ownerInfo?.id ?? '',
                profile_img_url: toRaribleImage(ownerInfo?.image),
                link: `${resolveRaribleUserNetwork(chainId as number)}${ownerInfo?.id ?? ''}`,
            } as NFTAssetOwner,
        }
    })
}

export async function getOrder(tokenAddress: string, tokenId: string, side: OrderSide, chainId: ChainId) {
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
    let histories = await fetchFromRarible<RaribleHistory[]>(RaribleMainnetURL, `activity`, {
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

function createNFTAsset(asset: RaribleNFTItemMapResponse, chainId: ChainId) {
    const owner = first(asset?.owners)
    const creator = first(asset?.creators)
    return {
        is_verified: false,
        isAuction: false,
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
            : null,
        slug: '',
        response_: asset,
    } as NFTAsset
}

async function _getAsset(address: string, tokenId: string) {
    const assetResponse = await fetchFromRarible<RaribleNFTItemMapResponse>(
        RaribleChainURL,
        urlcat('/v0.1/nft/items/:address::tokenId', {
            includeMeta: true,
            address,
            tokenId,
        }),
        {
            method: 'GET',
            mode: 'cors',
            headers: {
                'content-type': 'application/json',
            },
        },
    )
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

export async function getNFTs(from: string, chainId: ChainId) {
    const params = new URLSearchParams()
    params.append('owner', from)
    const assetResponse = await fetchFromRarible<{ total: number; items: RaribleNFTItemMapResponse[] }>(
        RaribleChainURL,
        urlcat(`/v0.1/nft/items/byOwner?owner=:from}`, { from }),
        {
            method: 'GET',
            mode: 'cors',
            headers: {
                'content-type': 'application/json',
            },
        },
    )
    return assetResponse.items.map((asset) => createERC721TokenAsset(asset.contract, asset.tokenId, asset))
}

export async function getContractBalance(from: string, contractAddress: string, chainId: ChainId) {
    const assets = await getNFTs(from, chainId)
    return assets.filter((asset) => isSameAddress(asset.contractDetailed.address, contractAddress)).length
}

export async function getNFTsPaged(from: string, opts: { chainId: ChainId; page?: number; size?: number }) {
    const asset = await fetchFromRarible<{
        total: number
        continuation: string
        items: RaribleNFTItemMapResponse[]
    }>(
        RaribleMainnetAPI_URL,
        urlcat(`/ethereum/nft/items/byOwner?owner=:from&size=:size}`, { from, size: opts.size }),
        {},
    )
    if (!asset) return [] as ERC721TokenDetailed[]

    return asset.items.map((asset) => createERC721TokenAsset(asset.contract, asset.tokenId, asset))
}

export async function getCollections(address: string, opts: { chainId: ChainId; page?: number; size?: number }) {
    const response = await fetchFromRarible<RaribleCollectibleResponse>(RaribleMainnetURL, `collections/${address}}`, {
        method: 'POST',
        body: JSON.stringify({ size: 20 }),
        headers: {
            'content-type': 'application/json',
        },
    })

    return [response]
}
