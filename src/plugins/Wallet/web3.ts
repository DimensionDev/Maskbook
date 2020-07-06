import Web3 from 'web3'
import type { WebsocketProvider, HttpProvider } from 'web3-core'
import { PluginMessageCenter } from '../PluginMessages'
import { sideEffect } from '../../utils/side-effects'
import { getNetworkSettings } from './UI/Developer/EthereumNetworkSettings'
import Services from '../../extension/service'
import { OnlyRunInContext } from '@holoflows/kit/es'
import { buf2hex } from '../../utils/utils'
import { currentEthereumNetworkSettings } from '../../settings/settings'

OnlyRunInContext('background', 'web3')

export const web3 = new Web3()
export const pool = new Map<string, WebsocketProvider>()

let provider: WebsocketProvider

export const createProvider = (url: string) => {
    // more: https://github.com/ethereum/web3.js/blob/1.x/packages/web3-providers-ws/README.md
    const options = {
        timeout: 5000, // ms
        reconnect: {
            auto: true,
            delay: 5000, // ms
            maxAttempts: Number.MAX_SAFE_INTEGER,
            onTimeout: true,
        },
    }
    if (url.startsWith('ws')) return new Web3.providers.WebsocketProvider(url, options)
    throw new Error(`${url} is not supported`)
}

export const resetProvider = () => {
    const url = getNetworkSettings().middlewareAddress

    console.log(`DEBUG: Reset to ${url}`)

    provider = pool.has(url) ? pool.get(url)! : createProvider(url)
    if (pool.has(url)) provider.reset()
    else pool.set(url, provider)
    provider.on('end', () => console.log('DEBUG: connection end'))
    provider.on('error', () => console.log('DEBUG: connection error'))
    web3.setProvider(provider)
}

export const resetWallet = async () => {
    web3.eth.accounts.wallet.clear()

    const [wallets] = await Services.Plugin.invokePlugin('maskbook.wallet', 'getWallets')
    for await (const { mnemonic, passphrase, privateKey } of wallets) {
        const { privateKey: privKey } =
            mnemonic && passphrase
                ? await Services.Plugin.invokePlugin('maskbook.wallet', 'recoverWallet', mnemonic, passphrase)
                : await Services.Plugin.invokePlugin('maskbook.wallet', 'recoverWalletFromPrivateKey', privateKey)
        web3.eth.accounts.wallet.add(`0x${buf2hex(privKey)}`)
    }
}

currentEthereumNetworkSettings.addListener(resetProvider)
PluginMessageCenter.on('maskbook.wallets.reset', resetWallet)

sideEffect.then(() => {
    resetWallet()
    resetProvider()
})
