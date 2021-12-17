import urlcat from 'urlcat'
import { ChainId } from '@masknet/web3-shared-evm'
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
import { RaribleChainURL, RaribleMainnetURL } from '../constants'
import { toRaribleImage } from '../helpers'
import { resolveRaribleUserNetwork } from '../pipes'

async function fetchFromRarible<T>(root: string, subPath: string, config = {} as RequestInit) {
    const response = await (
        await fetch(urlcat(root, subPath), {
            mode: 'cors',
            ...config,
        })
    ).json()

    return response as T
}

export async function getProfilesFromRarible(chainId: ChainId, addresses: (string | undefined)[]) {
    if (chainId !== ChainId.Mainnet) return []
    return fetchFromRarible<RaribleProfileResponse[]>(RaribleMainnetURL, 'profiles/list', {
        method: 'POST',
        body: stringify(addresses),
        headers: {
            'content-type': 'application/json',
        },
    })
}

export async function getNFTItem(chainId: ChainId, tokenAddress: string, tokenId: string) {
    if (chainId !== ChainId.Mainnet) return []
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

export async function getOffersFromRarible(chainId: ChainId, tokenAddress: string, tokenId: string) {
    if (chainId !== ChainId.Mainnet) return []
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

export async function getListingsFromRarible(chainId: ChainId, tokenAddress: string, tokenId: string) {
    if (chainId !== ChainId.Mainnet) return []
    const assets = await fetchFromRarible<Ownership[]>(RaribleMainnetURL, `items/${tokenAddress}:${tokenId}/ownerships`)
    const listings = assets.filter((x) => x.selling)
    const profiles = await getProfilesFromRarible(
        chainId,
        listings.map((x) => x.owner),
    )
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

export async function getOrderFromRarible(chainId: ChainId, tokenAddress: string, tokenId: string, side: OrderSide) {
    if (chainId !== ChainId.Mainnet) return []
    switch (side) {
        case OrderSide.Buy:
            return getOffersFromRarible(chainId, tokenAddress, tokenId)
        case OrderSide.Sell:
            return getListingsFromRarible(chainId, tokenAddress, tokenId)
        default:
            return []
    }
}

export async function getHistoryFromRarible(chainId: ChainId, tokenAddress: string, tokenId: string) {
    const result = await fetchFromRarible<RaribleHistory[]>(RaribleMainnetURL, `activity`, {
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

    const histories = result.length ? result.filter((x) => Object.values(RaribleEventType).includes(x['@type'])) : []
    const profiles = await getProfilesFromRarible(
        chainId,
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
