import { Network } from 'opensea-js'
import { unreachable } from '../../../utils/utils'
import { ChainId } from '../../../web3/types'
import { NullAddress, OpenSeaTraitURL, RaribleRopstenUserURL, RaribleUserURL } from '../constants'
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

export function resolveTraitLinkOnOpenSea(chainId: ChainId, search: string) {
    switch (chainId) {
        case ChainId.Rinkeby:
            return `https://testnets.opensea.io${OpenSeaTraitURL}${search}`
        default:
            return `https://opensea.io${OpenSeaTraitURL}${search}`
    }
}

export function resolveAssetLinkOnOpenSea(chainId: ChainId, address: string, id: string) {
    return `${resolveLinkOnOpenSea(chainId)}/assets/${address}/${id}`
}
