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
export const pool = new Map<string, WebsocketProvider>()

let provider: WebsocketProvider

export const resetProvider = () => {
    const url = getNetworkSettings().middlewareAddress
    provider = pool.has(url)
        ? pool.get(url)!
        : // more: https://github.com/ethereum/web3.js/blob/1.x/packages/web3-providers-ws/README.md
          new Web3.providers.WebsocketProvider(url, {
              timeout: 5000, // ms
              // @ts-ignore
              clientConfig: {
                  keepalive: true,
                  keepaliveInterval: 1, // ms
              },
              reconnect: {
                  auto: true,
                  delay: 5000, // ms
                  maxAttempts: Number.MAX_SAFE_INTEGER,
                  onTimeout: true,
              },
          })
    if (pool.has(url)) provider.reset()
    else pool.set(url, provider)
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
