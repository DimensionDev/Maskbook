import { ChainId, ERC20Token, ERC721Token, NativeToken, ProviderType } from './types'
import { safeUnreachable } from '../utils/utils'

export function resolveProviderName(providerType: ProviderType) {
    switch (providerType) {
        case ProviderType.Maskbook:
            return 'Mask'
        case ProviderType.MetaMask:
            return 'MetaMask'
        case ProviderType.WalletConnect:
            return 'WalletConnect'
        case ProviderType.UNKNOWN:
            return 'CustomNetwork'
        default:
            safeUnreachable(providerType)
            return 'Unknown'
    }
}

export function resolveChainId(name: string) {
    switch (name.toLowerCase()) {
        case 'mainnet':
            return ChainId.Mainnet
        case 'ropsten':
            return ChainId.Ropsten
        case 'rinkeby':
            return ChainId.Rinkeby
        case 'kovan':
            return ChainId.Kovan
        case 'gorli':
            return ChainId.Gorli
        default:
            return
    }
}

export function resolveChainName(chainId: ChainId) {
    switch (chainId) {
        case ChainId.Mainnet:
            return 'Mainnet'
        case ChainId.Ropsten:
            return 'Ropsten'
        case ChainId.Rinkeby:
            return 'Rinkeby'
        case ChainId.Kovan:
            return 'Kovan'
        case ChainId.Gorli:
            return 'Gorli'
        default:
            safeUnreachable(chainId)
            return 'Unknown'
    }
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
    switch (chainId) {
        case ChainId.Mainnet:
            return 'https://etherscan.io'
        case ChainId.Ropsten:
            return 'https://ropsten.etherscan.io'
        case ChainId.Rinkeby:
            return 'https://rinkeby.etherscan.io'
        case ChainId.Kovan:
            return 'https://kovan.etherscan.io'
        case ChainId.Gorli:
            return 'https://goerli.etherscan.io'
        default:
            safeUnreachable(chainId)
            return 'https://etherscan.io'
    }
}

export function resolveTransactionLinkOnExplorer(chainId: ChainId, tx: string) {
    return `${resolveLinkOnExplorer(chainId)}/tx/${tx}`
}

export function resolveTokenLinkOnEtherscan(token: NativeToken | ERC20Token | ERC721Token) {
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
