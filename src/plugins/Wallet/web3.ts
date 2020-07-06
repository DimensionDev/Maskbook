import Web3 from 'web3'
import type { WebsocketProvider } from 'web3-core'
import { PluginMessageCenter } from '../PluginMessages'
import { sideEffect } from '../../utils/side-effects'
import { currentEthereumNetworkSettings } from '../../settings/settings'
import { getNetworkSettings } from './UI/Developer/EthereumNetworkSettings'
import Services from '../../extension/service'
import { OnlyRunInContext } from '@holoflows/kit/es'

OnlyRunInContext('background', 'web3')

export const web3 = new Web3()

let provider: WebsocketProvider

export const resetProvider = () => {
    if (provider) {
        provider.removeListener('end', resetProvider) // prevent from circular reseting
        provider.disconnect(1000, 'change provider')
    }
    provider = new Web3.providers.WebsocketProvider(getNetworkSettings().middlewareAddress, {
        // @ts-ignore
        clientConfig: {
            keepalive: true,
            keepaliveInterval: 1e4, // milliseconds
        },
    })
    provider.on('end', resetProvider)
    web3.setProvider(provider)
}

export const resetWallet = async () => {
    web3.eth.accounts.wallet.clear()

    const { wallets } = await Services.Plugin.invokePlugin('maskbook.wallet', 'getManagedWallets')
    for await (const { mnemonic, passphrase, privateKey } of wallets) {
        const { privateKeyInHex } =
            mnemonic && passphrase
                ? await Services.Plugin.invokePlugin('maskbook.wallet', 'recoverWallet', mnemonic, passphrase)
                : await Services.Plugin.invokePlugin('maskbook.wallet', 'recoverWalletFromPrivateKey', privateKey)
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
