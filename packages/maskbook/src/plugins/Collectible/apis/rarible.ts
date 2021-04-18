import { RaribleBaseURL, RaribleUserURL } from '../constants'
import { Flags } from '../../../utils/flags'
import stringify from 'json-stable-stringify'
import type {
    RaribleCollectibleResponse,
    RaribleNFTItemMapResponse,
    RaribleNFTOwnershipResponse,
    RaribleOfferResponse,
    RaribleProfileResponse,
} from '../types'
import { head } from 'lodash-es'
import { OrderSide } from 'opensea-js/lib/types'
import { toRaribleImage } from '../helpers'

async function fetchFromRarible<T>(subPath: string, config = {} as RequestInit) {
    const response = await (
        await fetch(`${RaribleBaseURL}${subPath}`, {
            cache: Flags.trader_all_api_cached_enabled ? 'force-cache' : undefined,
            mode: 'cors',
            ...config,
        })
    ).json()

    return response as T
}

export async function getNFTItem(tokenAddress: string, tokenId: string) {
    const assetResponse = head(
        await fetchFromRarible<RaribleNFTItemMapResponse[]>('items/map', {
            method: 'POST',
            body: stringify([`${tokenAddress}:${tokenId}`]),
            headers: {
                'content-type': 'application/json',
            },
        }),
    )
    const collectionResponse = await fetchFromRarible<RaribleCollectibleResponse>(`collections/${tokenAddress}`)

    if (!assetResponse) throw new Error('fetch failed!')
    const profilesResponse = await fetchFromRarible<RaribleProfileResponse[]>('profiles/list', {
        method: 'POST',
        body: stringify([assetResponse.item.creator, head(assetResponse.item.owners)]),
        headers: {
            'content-type': 'application/json',
        },
    })

    const creator = profilesResponse.find((item) => item.id === assetResponse.item.creator)
    const owner = profilesResponse.find((item) => item.id === head(assetResponse.item.owners))
    return {
        ...assetResponse,
        owner,
        creator,
        assetContract: collectionResponse,
    }
}

export async function getOffersFromRarible(tokenAddress: string, tokenId: string) {
    const orders = await fetchFromRarible<RaribleOfferResponse[]>(`items/${tokenAddress}:${tokenId}/offers`)
    const profiles = await fetchFromRarible<RaribleProfileResponse[]>('profiles/list', {
        method: 'POST',
        body: stringify(orders.map((item) => item.owner)),
        headers: {
            'content-type': 'application/json',
        },
    })

    return orders.map((order) => {
        const ownerInfo = profiles.find((owner) => owner.id === order.owner)
        return {
            unitPrice: order.buyPriceEth,
            hash: order.signature,
            makerAccount: {
                user: {
                    username: ownerInfo?.name,
                },
                address: ownerInfo?.id,
                profile_img_url: toRaribleImage(ownerInfo?.image),
                link: `${RaribleUserURL}${ownerInfo?.id ?? ''}`,
            },
        }
    })
}

export async function getListingsFromRarible(tokenAddress: string, tokenId: string, owners: string[]) {
    const assets = await fetchFromRarible<RaribleNFTOwnershipResponse[]>('ownerships/list', {
        method: 'POST',
        body: stringify(owners.map((owner) => `${tokenAddress}:${tokenId}:${owner}`)),
        headers: {
            'content-type': 'application/json',
        },
    })
    const profiles = await fetchFromRarible<RaribleProfileResponse[]>('profiles/list', {
        method: 'POST',
        body: stringify(owners),
        headers: {
            'content-type': 'application/json',
        },
    })

    return assets
        .map((asset) => {
            const ownerInfo = profiles.find((owner) => owner.id === asset.ownership.owner)
            return {
                unitPrice: asset.ownership.priceEth,
                hash: asset.ownership.signature,
                makerAccount: {
                    user: {
                        username: ownerInfo?.name,
                    },
                    address: ownerInfo?.id,
                    profile_img_url: toRaribleImage(ownerInfo?.image),
                    link: `${RaribleUserURL}${ownerInfo?.id ?? ''}`,
                },
            }
        })
        .filter((item) => item.unitPrice)
}

export async function getOrderFromRarbile(tokenAddress: string, tokenId: string, side: OrderSide) {
    switch (side) {
        case OrderSide.Buy:
            return getOffersFromRarible(tokenAddress, tokenId)
        case OrderSide.Sell:
            const asset = head(
                await fetchFromRarible<RaribleNFTItemMapResponse[]>('items/map', {
                    method: 'POST',
                    body: stringify([`${tokenAddress}:${tokenId}`]),
                    headers: {
                        'content-type': 'application/json',
                    },
                }),
            )
            return getListingsFromRarible(tokenAddress, tokenId, asset?.item.owners ?? [])
        default:
            return []
    }
}
