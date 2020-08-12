import Web3 from 'web3'
import type { AbstractProvider, HttpProvider } from 'web3-core'
import { PluginMessageCenter } from '../PluginMessages'
import { sideEffect } from '../../utils/side-effects'
import { currentEthereumNetworkSettings } from '../../settings/settings'
import { OnlyRunInContext } from '@holoflows/kit/es'

OnlyRunInContext('background', 'web3')
import { metamaskProvider } from '../../protocols/wallet-provider/metamask'

export const web3 = new Web3()
export const pool = new Map<string, HttpProvider>()

let provider: AbstractProvider

export const resetProvider = () => {
    provider = metamaskProvider
    web3.setProvider(provider)
}

export const resetWallet = async () => {}

currentEthereumNetworkSettings.addListener(resetProvider)
PluginMessageCenter.on('maskbook.wallets.reset', resetWallet)

sideEffect.then(() => {
    resetWallet()
    resetProvider()
})
