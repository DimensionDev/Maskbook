import urlcat from 'urlcat'
import { unreachable } from '@dimensiondev/kit'
import { ChainId, NonFungibleAssetProvider } from '../types'

// TODO check ipfs inside before resolving
export function resolveIPFSLink(ipfs: string): string {
    return urlcat('https://coldcdn.com/api/cdn/mipfsygtms/ipfs/:ipfs', { ipfs })
}

export function resolveIPFSLinkFromURL(url: string): string {
    if (!url.startsWith('ipfs://')) return url
    return resolveIPFSLink(url.replace(/^ipfs:\/\/(ipfs\/)?/, ''))
}

export function resolveCollectibleAssetLink(chainId: ChainId, provider: NonFungibleAssetProvider) {
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            if (chainId === ChainId.Rinkeby) return 'https://testnets.opensea.io/assets'
            if (chainId === ChainId.Matic) return 'https://opensea.io/assets/matic'
            return 'https://opensea.io/assets'
        case NonFungibleAssetProvider.RARIBLE:
            return ''
        case NonFungibleAssetProvider.NFTSCAN:
            return ''
        case NonFungibleAssetProvider.ZORA:
            return ''
        default:
            unreachable(provider)
    }
}

export function resolveCollectibleLink(
    chainId: ChainId,
    provider: NonFungibleAssetProvider,
    address: string,
    tokenId: string,
) {
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return urlcat(resolveCollectibleAssetLink(chainId, provider), '/:address/:tokenId', {
                address,
                tokenId,
            })
        case NonFungibleAssetProvider.RARIBLE:
            return ''
        case NonFungibleAssetProvider.NFTSCAN:
            return ''
        case NonFungibleAssetProvider.ZORA:
            return ''
        default:
            unreachable(provider)
    }
}

export function resolveOpenSeaLink(address: string, tokenId: string) {
    return urlcat('https://opensea.io/assets/:address/:tokenId', {
        address,
        tokenId,
    })
}
