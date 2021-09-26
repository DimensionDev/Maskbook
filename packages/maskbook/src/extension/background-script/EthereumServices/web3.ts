import { ProviderType } from '@masknet/web3-shared'
import { unreachable } from '@dimensiondev/kit'
import * as Maskbook from './providers/Maskbook'
import * as MetaMask from './providers/MetaMask'
import * as WalletConnect from './providers/WalletConnect'
import { currentChainIdSettings, currentProviderSettings } from '../../../plugins/Wallet/settings'

export async function createWeb3({
    chainId = currentChainIdSettings.value,
    providerType = currentProviderSettings.value,
    privKeys = [] as string[],
} = {}) {
    switch (providerType) {
        case ProviderType.MaskWallet:
            return Maskbook.createWeb3({ chainId, privKeys })
        case ProviderType.MetaMask:
            return MetaMask.createWeb3()
        case ProviderType.WalletConnect:
            return WalletConnect.createWeb3({
                chainId,
            })
        case ProviderType.CustomNetwork:
            throw new Error('To be implemented.')
        default:
            unreachable(providerType)
    }
}
