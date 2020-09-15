import { ProviderType } from './types'
import { unreachable } from '../../utils/utils'

export function resolveProviderName(type: ProviderType) {
    switch (type) {
        case ProviderType.Maskbook:
            return 'Maskbook'
        case ProviderType.MetaMask:
            return 'MetaMask'
        case ProviderType.WalletConnect:
            return 'WalletConnect'
        default:
            unreachable(type)
    }
}
