import { ChainId, ERC20Token, ERC721Token, EtherToken, ProviderType } from './types'
import { safeUnreachable } from '../utils/utils'

export function resolveProviderName(providerType: ProviderType) {
    switch (providerType) {
        case ProviderType.Maskbook:
            return 'Mask'
        case ProviderType.MetaMask:
            return 'MetaMask'
        case ProviderType.WalletConnect:
            return 'WalletConnect'
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
        case 'matic':
            return ChainId.Matic
        case 'mumbai':
            return ChainId.Mumbai
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
        case ChainId.Matic:
            return 'Matic'
        case ChainId.Mumbai:
            return 'Matic Testnet'
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
        case ChainId.Matic:
            return 'rgb(48, 153, 242)'
        case ChainId.Mumbai:
            return 'rgb(48, 153, 242)'
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
        case ChainId.Gorli:
            return 'https://goerli.etherscan.io'
        case ChainId.Matic:
            return 'https://explorer.matic.network'
        case ChainId.Mumbai:
            return 'https://mumbai-explorer.matic.today'
        default:
            safeUnreachable(chainId)
            return 'https://etherscan.io'
    }
}

export function resolveTransactionLinkOnEtherscan(chainId: ChainId, tx: string) {
    return `${resolveLinkOnEtherscan(chainId)}/tx/${tx}`
}

export function resolveTokenLinkOnEtherscan(token: EtherToken | ERC20Token | ERC721Token) {
    return `${resolveLinkOnEtherscan(token.chainId)}/token/${token.address}`
}
