import { unreachable, safeUnreachable } from '@dimensiondev/kit'
import {
    ChainId,
    ERC20Token,
    ERC721Token,
    NativeToken,
    NetworkType,
    ERC721TokenDetailed,
    ProviderType,
    CollectibleProvider,
} from '../types'
import { getChainDetailed } from '../utils'
import urlcat from 'urlcat'

export function resolveProviderName(providerType: ProviderType) {
    switch (providerType) {
        case ProviderType.Maskbook:
            return 'Mask'
        case ProviderType.MetaMask:
            return 'MetaMask'
        case ProviderType.WalletConnect:
            return 'WalletConnect'
        case ProviderType.CustomNetwork:
            return 'CustomNetwork'
        default:
            safeUnreachable(providerType)
            return 'Unknown Network'
    }
}

export function resolveNetworkAddress(networkType: NetworkType, address: string) {
    switch (networkType) {
        case NetworkType.Binance:
            return `binance:${address}`
        case NetworkType.Polygon:
            return `polygon:${address}`
        case NetworkType.Ethereum:
            return `ethereum:${address}`
        case NetworkType.Arbitrum:
            return `arbitrum:${address}`
        case NetworkType.xDai:
            return `xdai:${address}`
        default:
            safeUnreachable(networkType)
            return address
    }
}

export function resolveNetworkName(networkType: NetworkType) {
    switch (networkType) {
        case NetworkType.Binance:
            return 'Binance Smart Chain'
        case NetworkType.Polygon:
            return 'Polygon'
        case NetworkType.Ethereum:
            return 'Ethereum'
        case NetworkType.Arbitrum:
            return 'Arbitrum'
        case NetworkType.xDai:
            return 'xDai'
        default:
            safeUnreachable(networkType)
            return 'Unknown'
    }
}

export function resolveChainName(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    return chainDetailed?.name ?? 'Unknown'
}

export function resolveChainFullName(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    return chainDetailed?.fullName ?? 'Unknown'
}

export function resolveChainColor(chainId: ChainId) {
    switch (chainId) {
        case ChainId.Mainnet:
            return 'rgb(41, 182, 175)'
        case ChainId.Ropsten:
            return 'rgb(255, 74, 141)'
        case ChainId.Kovan:
            return 'rgb(112, 87, 255)'
        case ChainId.Rinkeby:
            return 'rgb(246, 195, 67)'
        case ChainId.Gorli:
            return 'rgb(48, 153, 242)'
        case ChainId.BSCT:
            return 'rgb(240, 185, 10)'
        case ChainId.Mumbai:
            return 'rgb(130, 71, 229)'
        case ChainId.xDai:
            return 'rgb(73, 169, 166)'
        default:
            return 'rgb(214, 217, 220)'
    }
}

export function resolveLinkOnExplorer(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    if (!chainDetailed) return ''
    return chainDetailed.explorers?.[0]?.url ?? chainDetailed.infoURL
}

export function resolveTransactionLinkOnExplorer(chainId: ChainId, tx: string) {
    return urlcat(resolveLinkOnExplorer(chainId), '/tx/:tx', { tx })
}

export function resolveTokenLinkOnExplorer({ chainId, address }: NativeToken | ERC20Token | ERC721Token) {
    return urlcat(resolveLinkOnExplorer(chainId), '/token/:address', { address })
}

export function resolveAddressLinkOnExplorer(chainId: ChainId, address: string): string {
    return urlcat(resolveLinkOnExplorer(chainId), '/address/:address', { address })
}

export function resolveBlockLinkOnExplorer(chainId: ChainId, block: string): string {
    return urlcat(resolveLinkOnExplorer(chainId), '/block/:block', { block })
}

export function resolveIPFSLink(ipfs: string): string {
    return urlcat('https://ipfs.fleek.co/ipfs/:ipfs', { ipfs })
}

export function resolveCollectibleProviderLink(chainId: ChainId, provider: CollectibleProvider) {
    switch (provider) {
        case CollectibleProvider.OPENSEA:
            if (chainId === ChainId.Rinkeby) return `https://testnets.opensea.io`
            return `https://opensea.io`
        default:
            unreachable(provider)
    }
}

export function resolveCollectibleLink(
    chainId: ChainId,
    provider: CollectibleProvider,
    { contractDetailed: { address }, tokenId }: ERC721TokenDetailed,
) {
    switch (provider) {
        case CollectibleProvider.OPENSEA:
            return urlcat(resolveCollectibleProviderLink(chainId, provider), '/assets/:address/:tokenId', {
                address,
                tokenId,
            })
        default:
            unreachable(provider)
    }
}
