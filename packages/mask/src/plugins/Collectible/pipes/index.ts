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
        [NonFungibleAssetProvider.ZORA]: 'Zora',
    },
    (providerType) => {
        throw new Error(`Unknown provider type: ${providerType}.`)
    },
)

type RaribleSupportedChainId = ChainId.Mainnet | ChainId.Ropsten | ChainId.Rinkeby
export const resolveRaribleUserNetwork = createLookupTableResolver<RaribleSupportedChainId, string>(
    {
        [ChainId.Mainnet]: RaribleUserURL,
        [ChainId.Ropsten]: RaribleRopstenUserURL,
        [ChainId.Rinkeby]: RaribleRinkebyUserURL,
    },
    RaribleUserURL,
)

type OpenSeaSupportedChainId = ChainId.Mainnet | ChainId.Rinkeby
export const resolveLinkOnOpenSea = createLookupTableResolver<OpenSeaSupportedChainId, string>(
    {
        [ChainId.Mainnet]: OpenSeaMainnetURL,
        [ChainId.Rinkeby]: OpenSeaTestnetURL,
    },
    OpenSeaMainnetURL,
)

export const resolveLinkOnRarible = createLookupTableResolver<RaribleSupportedChainId, string>(
    {
        [ChainId.Mainnet]: 'https://rarible.com',
        [ChainId.Rinkeby]: 'https://rinkeby.rarible.com',
        [ChainId.Ropsten]: 'https://ropsten.rarible.com',
    },
    'https://rarible.com',
)

type ZoraSupportedChainId = ChainId.Mainnet
export const resolveLinkOnZora = createLookupTableResolver<ZoraSupportedChainId, string>(
    {
        [ChainId.Mainnet]: 'https://zora.co',
    },
    'https://zora.co',
)

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
            return urlcat(resolveLinkOnOpenSea(chainId as OpenSeaSupportedChainId), '/assets/:address/:id', {
                address,
                id,
            })
        case NonFungibleAssetProvider.RARIBLE:
            return urlcat(resolveLinkOnRarible(chainId as RaribleSupportedChainId), '/token/:address/:id', {
                address,
                id,
            })
        case NonFungibleAssetProvider.NFTSCAN:
            return ''
        case NonFungibleAssetProvider.ZORA:
            return urlcat(resolveLinkOnZora(chainId as ZoraSupportedChainId), '/collections/:address/:id', {
                address,
                id,
            })
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
            return urlcat(resolveRaribleUserNetwork(chainId as RaribleSupportedChainId), `/${address}`)
        case NonFungibleAssetProvider.OPENSEA:
            return urlcat(resolveLinkOnOpenSea(chainId as OpenSeaSupportedChainId), `/${username ?? ''}`)
        case NonFungibleAssetProvider.NFTSCAN:
            return ''
        case NonFungibleAssetProvider.ZORA:
            return urlcat(resolveLinkOnZora(chainId as ZoraSupportedChainId), `/${address}`)
        default:
            return ''
    }
}

export function resolveAvatarLinkOnCurrentProvider(chainId: ChainId, asset: any, provider: NonFungibleAssetProvider) {
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return urlcat(resolveLinkOnOpenSea(chainId as OpenSeaSupportedChainId), `/collection/${asset.slug ?? ''}`)
        case NonFungibleAssetProvider.RARIBLE:
            return urlcat(
                resolveLinkOnRarible(chainId as RaribleSupportedChainId),
                `/collection/${asset.token_address ?? ''}`,
            )
        case NonFungibleAssetProvider.NFTSCAN:
            return ''
        case NonFungibleAssetProvider.ZORA:
            return ''
        default:
            return ''
    }
}
