import Web3 from 'web3'
import { sideEffect } from '../../utils/side-effects'
import { OnlyRunInContext } from '@holoflows/kit/es'
import { MetaMaskProvider } from '../../protocols/wallet-provider/metamask'
import type { WalletProvider } from '../../protocols/wallet-provider'
import { MaskbookProvider } from '../../protocols/wallet-provider/maskbook'
import { unreachable } from '../../utils/utils'
import { PluginMessageCenter } from '../PluginMessages'
import { lastActivatedWalletProvider } from '../../settings/settings'
import { getWallets, recoverWallet, recoverWalletFromPrivateKey } from './wallet'
import { ProviderType } from '../../web3/types'

OnlyRunInContext(['background', 'debugging'], 'web3')

export const web3 = new Web3()

Object.assign(globalThis, { web3 })
let currentProvider: WalletProvider
function resetProvider() {
    switchToProvider(lastActivatedWalletProvider.value)
}

export function switchToProvider(provider: ProviderType) {
    console.log('[Web3] Switch to', provider)
    const nextProvider = getWalletProvider(provider)
    if (currentProvider === nextProvider) return
    currentProvider?.noLongerUseWeb3Provider?.()
    currentProvider = nextProvider
    web3.setProvider(getWalletProvider(provider).getWeb3Provider())
    importBuiltinWalletPrivateKey()
    lastActivatedWalletProvider.value = provider
}
export function getWalletProvider(provider: ProviderType) {
    if (provider === ProviderType.Maskbook) return MaskbookProvider
    if (provider === ProviderType.MetaMask) return MetaMaskProvider
    if (provider === ProviderType.WalletConnect) throw new Error('not supported')
    return unreachable(provider)
}

const importBuiltinWalletPrivateKey = async () => {
    web3.eth.accounts.wallet.clear()

    const wallets = await getWallets(ProviderType.Maskbook)
    for await (const { mnemonic, passphrase, _private_key_ } of wallets) {
        const { privateKeyValid, privateKeyInHex } =
            mnemonic && passphrase
                ? await recoverWallet(mnemonic, passphrase)
                : await recoverWalletFromPrivateKey(_private_key_)
        if (privateKeyValid) web3.eth.accounts.wallet.add(privateKeyInHex)
    }
}
