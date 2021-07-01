import { Network } from 'opensea-js'
import { unreachable } from '@dimensiondev/kit'
import { ChainId } from '@masknet/web3-shared'
import { NullAddress, RaribleRopstenUserURL, RaribleUserURL } from '../constants'
import { CollectibleProvider, OpenSeaAssetEventType, RaribleEventType } from '../types'

export function resolveOpenSeaAssetEventType(eventType: OpenSeaAssetEventType, fromUserName?: string) {
    switch (eventType) {
        case OpenSeaAssetEventType.CREATED:
            return fromUserName === NullAddress ? 'Created' : 'List'
        case OpenSeaAssetEventType.SUCCESSFUL:
            return 'Sale'
        case OpenSeaAssetEventType.CANCELLED:
            return 'Cancel'
        case OpenSeaAssetEventType.BID_WITHDRAWN:
            return 'Bid Cancel'
        case OpenSeaAssetEventType.BID_ENTERED:
            return 'Bid'
        case OpenSeaAssetEventType.TRANSFER:
            return fromUserName === NullAddress ? 'Created' : 'Transfer'
        case OpenSeaAssetEventType.OFFER_ENTERED:
            return 'Offer'
        default:
            return eventType
    }
}

export function resolveRaribleAssetEventType(eventType: RaribleEventType) {
    switch (eventType) {
        case RaribleEventType.BUY:
            return 'Buy'
        case RaribleEventType.OFFER:
            return 'Offer'
        case RaribleEventType.ORDER:
            return 'Order'
        case RaribleEventType.TRANSFER:
            return 'Transfer'
        default:
            return eventType
    }
}

export function resolveOpenSeaNetwork(chainId: ChainId) {
    switch (chainId) {
        case ChainId.Mainnet:
            return Network.Main
        case ChainId.Rinkeby:
            return Network.Rinkeby
        default:
            throw new Error(`The chain id ${chainId} is not supported.`)
    }
}

export function resolveCollectibleProviderName(provider: CollectibleProvider) {
    switch (provider) {
        case CollectibleProvider.OPENSEA:
            return 'OpenSea'
        case CollectibleProvider.RARIBLE:
            return 'Rarible'
        default:
            unreachable(provider)
    }
}

export function resolveRaribleUserNetwork(chainId: ChainId) {
    switch (chainId) {
        case ChainId.Mainnet:
            return RaribleUserURL
        case ChainId.Ropsten:
            return RaribleRopstenUserURL
        default:
            throw new Error(`The chain id ${chainId} is not supported.`)
    }
}

export function resolveLinkOnOpenSea(chainId: ChainId) {
    switch (chainId) {
        case ChainId.Rinkeby:
            return 'https://testnets.opensea.io'
        default:
            return 'https://opensea.io'
    }
}

export function resolveTraitLinkOnOpenSea(chainId: ChainId, slug: string, search: string, value: string) {
    if (chainId === ChainId.Rinkeby) {
        return `https://testnets.opensea.io/assets/${slug}?search[stringTraits][0][name]=${search}&search[stringTraits][0][values][0]=${value}`
    }

    return `https://opensea.io/assets/${slug}?search[stringTraits][0][name]=${search}&search[stringTraits][0][values][0]=${value}`
}

export function resolveAssetLinkOnOpenSea(chainId: ChainId, address: string, id: string) {
    return `${resolveLinkOnOpenSea(chainId)}/assets/${address}/${id}`
}
