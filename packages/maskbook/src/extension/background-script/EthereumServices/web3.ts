import { ProviderType } from '@masknet/web3-shared'
import { unreachable } from '@dimensiondev/kit'
import * as Maskbook from './providers/Maskbook'
import * as MetaMask from './providers/MetaMask'
import * as WalletConnect from './providers/WalletConnect'
import { currentChainIdSettings, currentProviderSettings } from '../../../plugins/Wallet/settings'
import { getWalletCached } from './wallet'

export function createWeb3({
    chainId = currentChainIdSettings.value,
    providerType = currentProviderSettings.value,
} = {}) {
    switch (providerType) {
        case ProviderType.Maskbook:
            const _private_key_ = getWalletCached()?._private_key_
            return Maskbook.createWeb3({
                chainId,
                privKeys: _private_key_ ? [_private_key_] : [],
            })
        case ProviderType.MetaMask:
            return MetaMask.createWeb3()
        case ProviderType.WalletConnect:
            return WalletConnect.createWeb3()
        case ProviderType.CustomNetwork:
            return WalletConnect.createWeb3()
        default:
            unreachable(providerType)
    }
}
