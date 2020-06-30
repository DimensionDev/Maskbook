import Web3 from 'web3'
import type { WebsocketProvider } from 'web3-core'
import { getWallets, recoverWallet, recoverWalletFromPrivateKey } from './wallet'
import { PluginMessageCenter } from '../PluginMessages'
import { sideEffect } from '../../utils/side-effects'
import { currentEthereumNetworkSettings, getNetworkSettings } from './UI/Developer/EthereumNetworkSettings'

export const web3 = new Web3()
export const pool = new Map<string, WebsocketProvider>()

let provider: WebsocketProvider

export const resetProvider = () => {
    const url = getNetworkSettings().middlewareAddress

    console.log(`DEBUG: Reset to ${url}`)

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

    const [wallets] = await getWallets()
    for await (const { mnemonic, passphrase, privateKey } of wallets) {
        const { privateKey: privKey } =
            mnemonic && passphrase
                ? await recoverWallet(mnemonic, passphrase)
                : await recoverWalletFromPrivateKey(privateKey)
        web3.eth.accounts.wallet.add(`0x${buf2hex(privKey)}`)
    }
}

currentEthereumNetworkSettings.addListener(resetProvider)
PluginMessageCenter.on('maskbook.wallets.reset', resetWallet)

sideEffect.then(() => {
    resetWallet()
    resetProvider()
})

export function buf2hex(buffer: ArrayBuffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), (x) => ('00' + x.toString(16)).slice(-2)).join('')
}
