import { ProviderType } from '@masknet/web3-shared-evm'
import { unreachable } from '@dimensiondev/kit'
import * as MaskWallet from './providers/MaskWallet'
import * as MetaMask from './providers/MetaMask'
import * as WalletConnect from './providers/WalletConnect'
import * as Injected from './providers/Injected'
import * as Fortmatic from './providers/Fortmatic'
import { currentChainIdSettings, currentProviderSettings } from '../../../plugins/Wallet/settings'

export async function createWeb3({
    chainId = currentChainIdSettings.value,
    providerType = currentProviderSettings.value,
    privKeys = [] as string[],
} = {}) {
    switch (providerType) {
        case ProviderType.MaskWallet:
            return MaskWallet.createWeb3({
                chainId,
                privKeys,
            })
        case ProviderType.MetaMask:
            return MetaMask.createWeb3()
        case ProviderType.WalletConnect:
            return WalletConnect.createWeb3({
                chainId,
            })
        case ProviderType.Coin98:
        case ProviderType.WalletLink:
        case ProviderType.MathWallet:
            return Injected.createWeb3()
        case ProviderType.Fortmatic:
            return Fortmatic.createWeb3()
        case ProviderType.CustomNetwork:
            throw new Error('To be implemented.')
        default:
            unreachable(providerType)
    }
}
