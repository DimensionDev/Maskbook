import { ChainId, ProviderType } from './types'
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

export function parseChainName(name: string) {
    switch (name.toLowerCase()) {
        case 'ropsten':
            return ChainId.Ropsten
        case 'rinkeby':
            return ChainId.Rinkeby
        case 'kovan':
            return ChainId.Kovan
        default:
            return ChainId.Mainnet
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
