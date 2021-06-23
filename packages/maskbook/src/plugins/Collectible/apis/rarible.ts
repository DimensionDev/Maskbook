import { RaribleMainetURL, RaribleRopstenURL } from '../constants'
import { compact, head } from 'lodash-es'
import { OrderSide } from 'opensea-js/lib/types'
import stringify from 'json-stable-stringify'
import { ChainId, getChainName } from '@masknet/web3-shared'
import { Flags } from '../../../utils/flags'
import type {
    RaribleCollectibleResponse,
    RaribleHistory,
    RaribleNFTItemMapResponse,
    RaribleNFTOwnershipResponse,
    RaribleOfferResponse,
    RaribleProfileResponse,
} from '../types'
import { toRaribleImage } from '../helpers'
import { resolveRaribleUserNetwork } from '../pipes'
import { currentChainIdSettings } from '../../Wallet/settings'

async function createRaribleApi() {
    const chainId = currentChainIdSettings.value
    if (![ChainId.Mainnet, ChainId.Ropsten].includes(chainId))
        throw new Error(`${getChainName(chainId)} is not supported.`)
    return chainId === ChainId.Mainnet ? RaribleMainetURL : RaribleRopstenURL
}

async function fetchFromRarible<T>(subPath: string, config = {} as RequestInit) {
    const response = await (
        await fetch(`${await createRaribleApi()}${subPath}`, {
            cache: Flags.trader_all_api_cached_enabled ? 'force-cache' : undefined,
            mode: 'cors',
            ...config,
        })
    ).json()

    return response as T
}

export async function getProfilesFromRarible(addresses: (string | undefined)[]) {
    return fetchFromRarible<RaribleProfileResponse[]>('profiles/list', {
        method: 'POST',
        body: stringify(addresses),
        headers: {
            'content-type': 'application/json',
        },
    })
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
    const profilesResponse = await getProfilesFromRarible([assetResponse.item.creator, head(assetResponse.item.owners)])

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
    const assets = await fetchFromRarible<RaribleNFTOwnershipResponse[]>('ownerships/list', {
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

export async function getHistoryFromRarible(tokenAddress: string, tokenId: string) {
    const histories = await fetchFromRarible<RaribleHistory[]>(`items/${tokenAddress}:${tokenId}/history`)
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
