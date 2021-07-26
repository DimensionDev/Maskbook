import { unreachable, safeUnreachable } from '@dimensiondev/kit'
import {
    ChainId,
    CollectibleProvider,
    ERC20Token,
    ERC721Token,
    NativeToken,
    NetworkType,
    NonFungibleTokenDetailed,
    ProviderType,
} from '../types'
import { getChainDetailed } from '../utils'

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
        default:
            return 'rgb(214, 217, 220)'
    }
}

export function resolveLinkOnExplorer(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    if (!chainDetailed) return ''
    return chainDetailed.explorers && chainDetailed.explorers.length > 0 && chainDetailed.explorers[0].url
        ? chainDetailed.explorers[0].url
        : chainDetailed.infoURL
}

export function resolveTransactionLinkOnExplorer(chainId: ChainId, tx: string) {
    return `${resolveLinkOnExplorer(chainId)}/tx/${tx}`
}

export function resolveTokenLinkOnExplorer(token: NativeToken | ERC20Token | ERC721Token) {
    return `${resolveLinkOnExplorer(token.chainId)}/token/${token.address}`
}

export function resolveAddressLinkOnExplorer(chainId: ChainId, address: string): string {
    return `${resolveLinkOnExplorer(chainId)}/address/${address}`
}

export function resolveBlockLinkOnExplorer(chainId: ChainId, block: string): string {
    return `${resolveLinkOnExplorer(chainId)}/block/${block}`
}

export function resolveIPFSLink(ipfs: string): string {
    return `https://ipfs.fleek.co/ipfs/${ipfs}`
}

export function resolveCollectibleProviderLink(chainId: ChainId, provider: CollectibleProvider) {
    switch (provider) {
        case CollectibleProvider.OPENSEAN:
            if (chainId === ChainId.Rinkeby) return `https://testnets.opensea.io`
            return `https://opensea.io`
        default:
            unreachable(provider)
    }
}

export function resolveCollectibleLink(
    chainId: ChainId,
    provider: CollectibleProvider,
    token: NonFungibleTokenDetailed,
) {
    switch (provider) {
        case CollectibleProvider.OPENSEAN:
            return `${resolveCollectibleProviderLink(chainId, provider)}/assets/${token.address}/${token.tokenId}`
        default:
            unreachable(provider)
    }
}
