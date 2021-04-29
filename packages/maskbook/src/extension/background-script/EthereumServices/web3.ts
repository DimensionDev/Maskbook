import * as Maskbook from './providers/Maskbook'
import * as MetaMask from './providers/MetaMask'
import * as WalletConnect from './providers/WalletConnect'
import { ProviderType } from '../../../web3/types'
import { currentSelectedWalletProviderSettings } from '../../../plugins/Wallet/settings'
import { unreachable } from '../../../utils/utils'
import { getWallet } from '../../../plugins/Wallet/services'

export async function createWeb3() {
    const providerType = currentSelectedWalletProviderSettings.value
    switch (providerType) {
        case ProviderType.Maskbook:
            const _private_key_ = (await getWallet())?._private_key_
            return Maskbook.createWeb3({
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
