import Web3 from 'web3'
import { WebsocketProvider } from 'web3-core'
import { getNetworkSettings, currentEthereumNetworkSettings } from './network'
import { getWallets, recoverWallet } from './wallet'
import { PluginMessageCenter } from '../PluginMessages'

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
        const { privateKey } = await recoverWallet(mnemonic, passphrase)
        web3.eth.accounts.wallet.add(`0x${buf2hex(privateKey)}`)
    }
}

currentEthereumNetworkSettings.addListener(resetProvider)
PluginMessageCenter.on('maskbook.wallets.reset', resetWallet)

resetWallet()
resetProvider()

export function buf2hex(buffer: ArrayBuffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('')
}
