import { identity } from 'lodash-unified'
import { Network } from 'opensea-js'
import { ChainId, createLookupTableResolver, NonFungibleAssetProvider } from '@masknet/web3-shared-evm'
import {
    NullAddress,
    RaribleRopstenUserURL,
    RaribleUserURL,
    RaribleRinkebyUserURL,
    OpenSeaMainnetURL,
    OpenSeaTestnetURL,
} from '../constants'
import { OpenSeaAssetEventType, RaribleEventType } from '../types'
import urlcat from 'urlcat'

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

export const resolveRaribleAssetEventType = createLookupTableResolver<RaribleEventType, string>(
    {
        [RaribleEventType.BUY]: 'Buy',
        [RaribleEventType.OFFER]: 'Offer',
        [RaribleEventType.ORDER]: 'Order',
        [RaribleEventType.TRANSFER]: 'Transfer',
    },
    identity,
)

export const resolveOpenSeaNetwork = createLookupTableResolver<ChainId.Mainnet | ChainId.Rinkeby, Network>(
    {
        [ChainId.Mainnet]: Network.Main,
        [ChainId.Rinkeby]: Network.Rinkeby,
    },
    Network.Main,
)

export const resolveCollectibleProviderName = createLookupTableResolver<NonFungibleAssetProvider, string>(
    {
        [NonFungibleAssetProvider.OPENSEA]: 'OpenSea',
        [NonFungibleAssetProvider.RARIBLE]: 'Rarible',
        [NonFungibleAssetProvider.NFTSCAN]: 'NFTScan',
    },
    (providerType) => {
        throw new Error(`Unknown provider type: ${providerType}.`)
    },
)

export function resolveRaribleUserNetwork(chainId: ChainId) {
    switch (chainId) {
        case ChainId.Mainnet:
            return RaribleUserURL
        case ChainId.Ropsten:
            return RaribleRopstenUserURL
        case ChainId.Rinkeby:
            return RaribleRinkebyUserURL
        default:
            return RaribleUserURL
    }
}

export function resolveLinkOnOpenSea(chainId: ChainId) {
    switch (chainId) {
        case ChainId.Mainnet:
            return OpenSeaMainnetURL
        case ChainId.Rinkeby:
            return OpenSeaTestnetURL
        default:
            return OpenSeaMainnetURL
    }
}

export function resolveLinkOnRarible(chainId: ChainId) {
    switch (chainId) {
        case ChainId.Mainnet:
            return 'https://rarible.com'
        case ChainId.Rinkeby:
            return 'https://rinkeby.rarible.com'
        case ChainId.Ropsten:
            return 'https://ropsten.rarible.com'
        default:
            return 'https://rarible.com'
    }
}

export function resolveTraitLinkOnOpenSea(chainId: ChainId, slug: string, search: string, value: string) {
    if (chainId === ChainId.Rinkeby) {
        return `https://testnets.opensea.io/assets/${slug}?search[stringTraits][0][name]=${search}&search[stringTraits][0][values][0]=${value}`
    }

    return `https://opensea.io/assets/${slug}?search[stringTraits][0][name]=${search}&search[stringTraits][0][values][0]=${value}`
}

export function resolveAssetLinkOnCurrentProvider(
    chainId: ChainId,
    address: string,
    id: string,
    provider: NonFungibleAssetProvider,
) {
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return urlcat(resolveLinkOnOpenSea(chainId), ‘/assets/:address/:id', { address, id })
        case NonFungibleAssetProvider.RARIBLE:
            return urlcat(resolveLinkOnRarible(chainId), '/token/:address::id', { address, id })
        case NonFungibleAssetProvider.NFTSCAN:
            return ''
        default:
            return ''
    }
}

export function resolveUserUrlOnCurrentProvider(
    chainId: ChainId,
    address: string,
    provider: NonFungibleAssetProvider,
    username?: string,
) {
    switch (provider) {
        case NonFungibleAssetProvider.RARIBLE:
            return urlcat(resolveRaribleUserNetwork(chainId), `/${address}`)
        case NonFungibleAssetProvider.OPENSEA:
            return urlcat(resolveLinkOnOpenSea(chainId), `/${username ?? ''}`)
        case NonFungibleAssetProvider.NFTSCAN:
            return ''
        default:
            return ''
    }
}

export function resolveAvatarLinkOnCurrentProvider(chainId: ChainId, asset: any, provider: NonFungibleAssetProvider) {
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return urlcat(resolveLinkOnOpenSea(chainId), `/collection/${asset.slug ?? ''}`)
        case NonFungibleAssetProvider.RARIBLE:
            return urlcat(resolveLinkOnRarible(chainId), `/collection/${asset.token_address ?? ''}`)
        case NonFungibleAssetProvider.NFTSCAN:
            return ''
        default:
            return ''
    }
}
