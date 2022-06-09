import urlcat from 'urlcat'
import { Network } from 'opensea-js'
import { ChainId } from '@masknet/web3-shared-evm'
import { createLookupTableResolver, createPredicate, SourceType } from '@masknet/web3-shared-base'
import {
    RaribleRopstenUserURL,
    RaribleUserURL,
    RaribleRinkebyUserURL,
    OpenSeaMainnetURL,
    OpenSeaTestnetURL,
} from '../constants'

type RaribleSupportedChainId = ChainId.Mainnet | ChainId.Ropsten | ChainId.Rinkeby
type OpenSeaSupportedChainId = ChainId.Mainnet | ChainId.Rinkeby
type ZoraSupportedChainId = ChainId.Mainnet

export const isOpenSeaSupportedChainId = createPredicate<ChainId, ChainId.Mainnet | ChainId.Rinkeby>([
    ChainId.Mainnet,
    ChainId.Rinkeby,
])

export const resolveOpenSeaNetwork = createLookupTableResolver<ChainId.Mainnet | ChainId.Rinkeby, Network>(
    {
        [ChainId.Mainnet]: Network.Main,
        [ChainId.Rinkeby]: Network.Rinkeby,
    },
    Network.Main,
)

export const resolveCollectibleProviderName = createLookupTableResolver<SourceType, string>(
    {
        [SourceType.DeBank]: 'DeBank',
        [SourceType.Zerion]: 'Zerion',
        [SourceType.RSS3]: 'RSS3',
        [SourceType.OpenSea]: 'OpenSea',
        [SourceType.Rarible]: 'Rarible',
        [SourceType.NFTScan]: 'NFTScan',
        [SourceType.Zora]: 'Zora',
    },
    (providerType) => {
        throw new Error(`Unknown provider type: ${providerType}.`)
    },
)

export const resolveRaribleUserNetwork = createLookupTableResolver<RaribleSupportedChainId, string>(
    {
        [ChainId.Mainnet]: RaribleUserURL,
        [ChainId.Ropsten]: RaribleRopstenUserURL,
        [ChainId.Rinkeby]: RaribleRinkebyUserURL,
    },
    RaribleUserURL,
)

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

export function resolveAssetLinkOnCurrentProvider(chainId: ChainId, address: string, id: string, provider: SourceType) {
    switch (provider) {
        case SourceType.OpenSea:
            return urlcat(resolveLinkOnOpenSea(chainId as OpenSeaSupportedChainId), '/assets/:address/:id', {
                address,
                id,
            })
        case SourceType.Rarible:
            return urlcat(resolveLinkOnRarible(chainId as RaribleSupportedChainId), '/token/:address::id', {
                address,
                id,
            })
        case SourceType.NFTScan:
            return ''
        case SourceType.Zora:
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
    provider: SourceType,
    username?: string,
) {
    switch (provider) {
        case SourceType.Rarible:
            return urlcat(resolveRaribleUserNetwork(chainId as RaribleSupportedChainId), `/${address}`)
        case SourceType.OpenSea:
            return urlcat(resolveLinkOnOpenSea(chainId as OpenSeaSupportedChainId), `/${username ?? ''}`)
        case SourceType.NFTScan:
            return ''
        case SourceType.Zora:
            return urlcat(resolveLinkOnZora(chainId as ZoraSupportedChainId), `/${address}`)
        default:
            return ''
    }
}

export function resolveAvatarLinkOnCurrentProvider(chainId: ChainId, asset: any, provider: SourceType) {
    switch (provider) {
        case SourceType.OpenSea:
            return urlcat(resolveLinkOnOpenSea(chainId as OpenSeaSupportedChainId), `/collection/${asset.slug ?? ''}`)
        case SourceType.Rarible:
            return urlcat(
                resolveLinkOnRarible(chainId as RaribleSupportedChainId),
                `/collection/${asset.token_address ?? ''}`,
            )
        case SourceType.NFTScan:
            return ''
        case SourceType.Zora:
            return ''
        default:
            return ''
    }
}
