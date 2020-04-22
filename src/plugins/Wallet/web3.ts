import Web3 from 'web3'
import type { WebsocketProvider } from 'web3-core'
import { getNetworkSettings, currentEthereumNetworkSettings } from './network'
import { getWallets, recoverWallet } from './wallet'
import { PluginMessageCenter } from '../PluginMessages'
import { sideEffect } from '../../utils/side-effects'

export const web3 = new Web3()

let provider: WebsocketProvider

export const resetProvider = () => {
    if (provider) {
        provider.removeListener('end', resetProvider) // prevent from circular reseting
        provider.disconnect(-1, 'change provider')
    }
    const newProvider = new Web3.providers.WebsocketProvider(getNetworkSettings().middlewareAddress)

    newProvider.on('end', resetProvider)
    provider = newProvider
    web3.setProvider(newProvider)
}

export const resetWallet = async () => {
    web3.eth.accounts.wallet.clear()

    const [wallets] = await getWallets()

    for await (const { mnemonic, passphrase } of wallets) {
        const { privateKeyInHex } = await recoverWallet(mnemonic, passphrase)
        web3.eth.accounts.wallet.add(privateKeyInHex)
    }
}

currentEthereumNetworkSettings.addListener(resetProvider)
PluginMessageCenter.on('maskbook.wallets.reset', resetWallet)

sideEffect.then(() => {
    /* without redpacket */
    if (webpackEnv.target === 'WKWebview') return
    resetWallet()
    resetProvider()
})
