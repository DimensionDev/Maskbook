import Web3 from 'web3'
import { sideEffect } from '../../utils/side-effects'
import { OnlyRunInContext } from '@holoflows/kit/es'

OnlyRunInContext('background', 'web3')
import { WalletProviderType } from '../shared/findOutProvider'
import { MetaMaskProvider } from '../../protocols/wallet-provider/metamask'
import type { WalletProvider } from '../../protocols/wallet-provider'
import { MaskbookProvider } from '../../protocols/wallet-provider/maskbook'
import { unreachable } from '../../utils/utils'
import { PluginMessageCenter } from '../PluginMessages'
import { lastActivatedWalletProvider } from '../../settings/settings'
import { getManagedWallets, recoverWallet, recoverWalletFromPrivateKey } from './wallet'

export const web3 = new Web3()
let currentProvider: WalletProvider
function resetProvider() {
    switchToProvider(lastActivatedWalletProvider.value)
}
sideEffect.then(resetProvider)
export function switchToProvider(provider: WalletProviderType) {
    console.log('[Web3] Switch to', provider)
    const nextProvider = getWalletProvider(provider)
    if (currentProvider === nextProvider) return
    currentProvider?.noLongerUseWeb3Provider?.()
    currentProvider = nextProvider
    web3.setProvider(getWalletProvider(provider).getWeb3Provider())
    importBuiltinWalletPrivateKey()
    PluginMessageCenter.emit('maskbook.wallets.reset', void 0)
    lastActivatedWalletProvider.value = provider
}
export function getWalletProvider(provider: WalletProviderType) {
    if (provider === WalletProviderType.managed) return MaskbookProvider
    if (provider === WalletProviderType.metamask) return MetaMaskProvider
    return unreachable(provider)
}

const importBuiltinWalletPrivateKey = async () => {
    web3.eth.accounts.wallet.clear()

    const { wallets } = await getManagedWallets()
    for await (const { mnemonic, passphrase, privateKey } of wallets) {
        const { privateKeyValid, privateKeyInHex } =
            mnemonic && passphrase
                ? await recoverWallet(mnemonic, passphrase)
                : await recoverWalletFromPrivateKey(privateKey)
        if (privateKeyValid) web3.eth.accounts.wallet.add(privateKeyInHex)
    }
}
