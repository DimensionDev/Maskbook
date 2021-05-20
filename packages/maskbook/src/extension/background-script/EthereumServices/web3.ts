import type Web3 from 'web3'
import * as Maskbook from './providers/Maskbook'
import * as MetaMask from './providers/MetaMask'
import * as WalletConnect from './providers/WalletConnect'
import { ProviderType } from '../../../web3/types'
import { currentMaskbookChainIdSettings, currentSelectedWalletProviderSettings } from '../../../plugins/Wallet/settings'
import { unreachable } from '../../../utils/utils'
import { getWalletCached } from './wallet'

export async function createWeb3({
    // this parameter only available if a managed wallet was selected
    chainId = currentMaskbookChainIdSettings.value,
    providerType = currentSelectedWalletProviderSettings.value,
} = {}): Promise<Web3> {
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
