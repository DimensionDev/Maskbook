import * as Maskbook from './providers/Maskbook'
import * as MetaMask from './providers/MetaMask'
import * as WalletConnect from './providers/WalletConnect'
import { ProviderType } from '../../../web3/types'
import { currentMaskbookChainIdSettings, currentSelectedWalletProviderSettings } from '../../../plugins/Wallet/settings'
import { unreachable } from '../../../utils/utils'
import { getWalletCached } from './wallet'

export async function createWeb3({
    // only available if the chain id is Maskbook
    chainId = currentMaskbookChainIdSettings.value,
    providerType = currentSelectedWalletProviderSettings.value,
} = {}) {
    switch (providerType) {
        case ProviderType.Maskbook:
            const _private_key_ = getWalletCached()?._private_key_
            return Maskbook.createWeb3({
                chainId,
                privKeys: _private_key_ ? [_private_key_] : [],
            })
        case ProviderType.MetaMask:
            return await MetaMask.createWeb3()
        case ProviderType.WalletConnect:
            return WalletConnect.createWeb3()
        default:
            unreachable(providerType)
    }
}
