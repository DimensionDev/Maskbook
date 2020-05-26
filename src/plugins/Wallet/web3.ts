import Web3 from 'web3'
import type { WebsocketProvider } from 'web3-core'
import { getNetworkSettings, ethereumNetworkSettings } from './network'
import { getWallets, recoverWallet, recoverWalletFromPrivateKey } from './wallet'
import { PluginMessageCenter } from '../PluginMessages'
import { sideEffect } from '../../utils/side-effects'

export const web3 = new Web3()

let provider: WebsocketProvider

export const resetProvider = () => {
    if (provider) {
        provider.removeListener('end', resetProvider) // prevent from circular reseting
        provider.disconnect(1000, 'change provider')
    }
    provider = new Web3.providers.WebsocketProvider(getNetworkSettings().middlewareAddress)
    provider.on('end', resetProvider)
    web3.setProvider(provider)
}

export const resetWallet = async () => {
    web3.eth.accounts.wallet.clear()

    const [wallets] = await getWallets()
    for await (const { mnemonic, passphrase, privateKey } of wallets) {
        const { privateKeyInHex } =
            mnemonic && passphrase
                ? await recoverWallet(mnemonic, passphrase)
                : await recoverWalletFromPrivateKey(privateKey)
        web3.eth.accounts.wallet.add(privateKeyInHex)
    }
}

ethereumNetworkSettings.addListener(resetProvider)
PluginMessageCenter.on('maskbook.wallets.reset', resetWallet)

sideEffect.then(() => {
    /* without redpacket */
    if (webpackEnv.target === 'WKWebview') return
    resetWallet()
    resetProvider()
})
