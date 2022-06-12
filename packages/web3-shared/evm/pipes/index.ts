import urlcat from 'urlcat'
import { ChainId } from '../types'
import { SourceType } from '@masknet/web3-shared-base'

// TODO check ipfs inside before resolving
export function resolveIPFSLink(ipfs: string): string {
    return urlcat('https://coldcdn.com/api/cdn/mipfsygtms/ipfs/:ipfs', { ipfs })
}

export function resolveIPFSLinkFromURL(url: string): string {
    if (!url.startsWith('ipfs://')) return url
    return resolveIPFSLink(url.replace(/^ipfs:\/\/(ipfs\/)?/, ''))
}

export function resolveCollectibleAssetLink(chainId: ChainId, provider: SourceType) {
    switch (provider) {
        case SourceType.OpenSea:
            if (chainId === ChainId.Rinkeby) return 'https://testnets.opensea.io/assets'
            if (chainId === ChainId.Matic) return 'https://opensea.io/assets/matic'
            return 'https://opensea.io/assets'
        case SourceType.Rarible:
            return ''
        case SourceType.NFTScan:
            return ''
        case SourceType.Zora:
            return ''
        default:
            return ''
    }
}

export function resolveCollectibleLink(chainId: ChainId, provider: SourceType, address: string, tokenId: string) {
    switch (provider) {
        case SourceType.OpenSea:
            return urlcat(resolveCollectibleAssetLink(chainId, provider), '/:address/:tokenId', {
                address,
                tokenId,
            })
        case SourceType.Rarible:
            return ''
        case SourceType.NFTScan:
            return ''
        case SourceType.Zora:
            return ''
        default:
            return ''
    }
}

export function resolveOpenSeaLink(contractAddress: string, tokenId: string, chainId?: ChainId) {
    if (chainId === ChainId.Matic) {
        return urlcat('https://opensea.io/assets/matic/:address/:tokenId', {
            address: contractAddress,
            tokenId,
        })
    }
    return urlcat('https://opensea.io/assets/:address/:tokenId', {
        address: contractAddress,
        tokenId,
    })
}
