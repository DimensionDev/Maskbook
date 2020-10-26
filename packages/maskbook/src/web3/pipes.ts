import { ChainId, ProviderType, Token } from './types'
import { unreachable } from '../utils/utils'

export function resolveProviderName(providerType: ProviderType) {
    switch (providerType) {
        case ProviderType.Maskbook:
            return 'Maskbook'
        case ProviderType.MetaMask:
            return 'MetaMask'
        case ProviderType.WalletConnect:
            return 'WalletConnect'
        default:
            unreachable(providerType)
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
        default:
            unreachable(chainId)
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
        default:
            return 'silver'
    }
}

export function resolveLinkOnEtherscan(chainId: ChainId) {
    switch (chainId) {
        case ChainId.Mainnet:
            return 'https://etherscan.io'
        case ChainId.Ropsten:
            return 'https://ropsten.etherscan.io'
        case ChainId.Rinkeby:
            return 'https://rinkeby.etherscan.io'
        case ChainId.Kovan:
            return 'https://kovan.etherscan.io'
        default:
            unreachable(chainId)
    }
}

export function resolveTransactionLinkOnEtherscan(chainId: ChainId, tx: string) {
    return `${resolveLinkOnEtherscan(chainId)}/tx/${tx}`
}

export function resolveTokenLinkOnEtherscan(token: Token) {
    return `${resolveLinkOnEtherscan(token.chainId)}/token/${token.address}`
}
