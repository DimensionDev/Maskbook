import { RaribleChainURL } from '../constants'
import { compact, head } from 'lodash-es'
import { OrderSide } from 'opensea-js/lib/types'
import stringify from 'json-stable-stringify'
import type {
    RaribleHistory,
    RaribleNFTItemMapResponse,
    RaribleNFTOwnershipResponse,
    RaribleOfferResponse,
    RaribleProfileResponse,
} from '../types'
import { toRaribleImage } from '../helpers'
import { resolveRaribleUserNetwork } from '../pipes'
import { currentChainIdSettings } from '../../Wallet/settings'
import urlcat from 'urlcat'

async function fetchFromRarible<T>(root: string, subPath: string, config = {} as RequestInit) {
    const response = await (
        await fetch(urlcat(root, subPath), {
            mode: 'cors',
            ...config,
        })
    ).json()

    return response as T
}

export async function getProfilesFromRarible(addresses: (string | undefined)[]) {
    return fetchFromRarible<RaribleProfileResponse[]>(RaribleChainURL, 'profiles/list', {
        method: 'POST',
        body: stringify(addresses),
        headers: {
            'content-type': 'application/json',
        },
    })
}

export async function getNFTItem(tokenAddress: string, tokenId: string) {
    const assetResponse = await fetchFromRarible<RaribleNFTItemMapResponse>(
        RaribleChainURL,
        urlcat('/v0.1/nft/items/:tokenAddress::tokenId', {
            includeMeta: true,
            tokenAddress,
            tokenId,
        }),
        {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
            },
        },
    )
    return assetResponse
}

export async function getOffersFromRarible(tokenAddress: string, tokenId: string) {
    const orders = await fetchFromRarible<RaribleOfferResponse[]>(
        RaribleChainURL,
        `items/${tokenAddress}:${tokenId}/offers`,
    )
    const profiles = await getProfilesFromRarible(orders.map((item) => item.owner))
    const chainId = currentChainIdSettings.value
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
                link: `${resolveRaribleUserNetwork(chainId)}${ownerInfo?.id ?? ''}`,
            },
        }
    })
}

export async function getListingsFromRarible(tokenAddress: string, tokenId: string, owners: string[]) {
    const assets = await fetchFromRarible<RaribleNFTOwnershipResponse[]>(RaribleChainURL, 'ownerships/list', {
        method: 'POST',
        body: stringify(owners.map((owner) => `${tokenAddress}:${tokenId}:${owner}`)),
        headers: {
            'content-type': 'application/json',
        },
    })
    const profiles = await getProfilesFromRarible(owners)
    const chainId = currentChainIdSettings.value
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
                    link: `${resolveRaribleUserNetwork(chainId)}${ownerInfo?.id ?? ''}`,
                },
            }
        })
        .filter((item) => item.unitPrice)
}

export async function getOrderFromRarible(tokenAddress: string, tokenId: string, side: OrderSide) {
    switch (side) {
        case OrderSide.Buy:
            return getOffersFromRarible(tokenAddress, tokenId)
        case OrderSide.Sell:
            const asset = head(
                await fetchFromRarible<RaribleNFTItemMapResponse[]>(RaribleChainURL, 'items/map', {
                    method: 'POST',
                    body: stringify([`${tokenAddress}:${tokenId}`]),
                    headers: {
                        'content-type': 'application/json',
                    },
                }),
            )
            return getListingsFromRarible(tokenAddress, tokenId, [])
        default:
            return []
    }
}

export async function getHistoryFromRarible(tokenAddress: string, tokenId: string) {
    const histories = await fetchFromRarible<RaribleHistory[]>(
        RaribleChainURL,
        `items/${tokenAddress}:${tokenId}/history`,
    )
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
            ...history,
            ownerInfo,
            fromInfo,
        }
    })
}
