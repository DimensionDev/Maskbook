import { Network } from 'opensea-js'
import { unreachable } from '@dimensiondev/kit'
import { ChainId, createLookupTableResolver} from '@masknet/web3-shared'
import { NullAddress, RaribleRopstenUserURL, RaribleUserURL } from '../constants'
import { CollectibleProvider, OpenSeaAssetEventType, RaribleEventType } from '../types'


export const resolveOpenSeaAssetEventType = createLookupTableResolver<OpenSeaAssetEventType, string>
(
    {
        [OpenSeaAssetEventType.CREATED]: fromUserName === NullAddress ? 'Created' : 'List',
        [OpenSeaAssetEventType.SUCCESSFUL]: 'Sale',
        [OpenSeaAssetEventType.CANCELLED]: 'Cancel',
        [OpenSeaAssetEventType.BID_WITHDRAWN]: 'Bid Cancel',
        [OpenSeaAssetEventType.BID_ENTERED]: 'Bid',
        [OpenSeaAssetEventType.TRANSFER]: fromUserName === NullAddress ? 'Created' : 'Transfer',
        [OpenSeaAssetEventType.OFFER_ENTERED]: 'Offer'  
    },
    (eventType) => {
        throw new Error(`Unknown event type: ${eventType}`)
    },
) 

export const resolveRaribleAssetEventType = createLookupTableResolver<RaribleEventType, string> (
    {
        [RaribleEventType.BUY]: 'Buy',
        [RaribleEventType.OFFER]: 'Offer',
        [RaribleEventType.ORDER]: 'Order',
        [RaribleEventType.TRANSFER]: 'Transfer'
    },  
    (eventType) => {
        throw new Error(`Unknown event type: ${eventType}`) 
    }
)


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
