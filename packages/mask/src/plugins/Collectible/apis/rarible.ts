import { RaribleChainURL, RaribleMainnetURL } from '../constants'
import { compact } from 'lodash-unified'
import { OrderSide } from 'opensea-js/lib/types'
import stringify from 'json-stable-stringify'
import {
    Ownership,
    RaribleEventType,
    RaribleHistory,
    RaribleNFTItemMapResponse,
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
    return fetchFromRarible<RaribleProfileResponse[]>(RaribleMainnetURL, 'profiles/list', {
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
        RaribleMainnetURL,
        `items/${tokenAddress}:${tokenId}/offers`,
        {
            method: 'POST',
            body: stringify({ size: 20 }),
            headers: {
                'content-type': 'application/json',
            },
        },
    )
    const profiles = await getProfilesFromRarible(orders.map((item) => item.maker))
    const chainId = currentChainIdSettings.value
    return orders.map((order) => {
        const ownerInfo = profiles.find((owner) => owner.id === order.maker)
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

export async function getListingsFromRarible(tokenAddress: string, tokenId: string) {
    const assets = await fetchFromRarible<Ownership[]>(RaribleMainnetURL, `items/${tokenAddress}:${tokenId}/ownerships`)
    const listings = assets.filter((x) => x.selling)
    const profiles = await getProfilesFromRarible(listings.map((x) => x.owner))
    const chainId = currentChainIdSettings.value
    return listings.map((asset) => {
        const ownerInfo = profiles.find((owner) => owner.id === asset.owner)
        return {
            unitPrice: asset.priceEth,
            hash: asset.signature,
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

export async function getOrderFromRarible(tokenAddress: string, tokenId: string, side: OrderSide) {
    switch (side) {
        case OrderSide.Buy:
            return getOffersFromRarible(tokenAddress, tokenId)
        case OrderSide.Sell:
            return getListingsFromRarible(tokenAddress, tokenId)
        default:
            return []
    }
}

export async function getHistoryFromRarible(tokenAddress: string, tokenId: string) {
    let histories = await fetchFromRarible<RaribleHistory[]>(RaribleMainnetURL, `activity`, {
        method: 'POST',
        body: stringify({
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
            ...history,
            ownerInfo,
            fromInfo,
        }
    })
}
