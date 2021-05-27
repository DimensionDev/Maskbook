import { safeUnreachable } from '@dimensiondev/maskbook-shared'
import { ChainId, ERC20Token, ERC721Token, NativeToken, NetworkType, ProviderType } from '../types'
import CHAINS from '../assets/chains.json'
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
            return 'Unknown'
    }
}

export function resolveChainId(name: string) {
    const chainDetailed = CHAINS.find((x) =>
        [x.chain, x.network, x.shortName, x.fullName].map((y) => y.toLowerCase()).includes(name.toLowerCase()),
    )
    return chainDetailed?.chainId as ChainId | undefined
}

export function resolveNetworkChainId(networkType: NetworkType) {
    switch (networkType) {
        case NetworkType.Ethereum:
            return ChainId.Mainnet
        case NetworkType.Binance:
            return ChainId.BSC
        case NetworkType.Polygon:
            return ChainId.Matic
        default:
            safeUnreachable(networkType)
            return ChainId.Mainnet
    }
}

export function resolveChainDetailed(chainId: ChainId) {
    const chainDetailed = CHAINS.find((x) => x.chainId === chainId)
    if (!chainDetailed) throw new Error('Unknown chain id.')
    return chainDetailed
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

export function checkIfChainSupport(chainId: number) {
    return Object.values(ChainId).includes(chainId)
}
