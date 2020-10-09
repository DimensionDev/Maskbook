import Web3 from 'web3'
import createMetaMaskProvider, { MetamaskInpageProvider } from 'metamask-extension-provider'
import { ChainId } from '../../../../web3/types'
import { currentMetaMaskChainIdSettings } from '../../../../settings/settings'
import { EthereumAddress } from 'wallet.ts'
import { updateExoticWalletFromSource, setDefaultWallet } from '../../../../plugins/Wallet/services'
import { ProviderType } from '../../../../web3/types'
import { sideEffect } from '../../../../utils/side-effects'
import { MessageCenter } from '../../../../utils/messages'
import { Flags } from '../../../../utils/flags'

//#region tracking chain id
let currentChainId: ChainId = ChainId.Mainnet
currentMetaMaskChainIdSettings.addListener((v) => (currentChainId = v))
//#endregion

let provider: MetamaskInpageProvider | null = null
let web3: Web3 | null = null

async function onData(error: Error | null, event?: { method: string; result: string[] }) {
    if (error) return
    if (!event) return
    if (event.method !== 'wallet_accountsChanged') return
    await updateWalletInDB(event.result[0] ?? '', false)
}

function onNetworkChanged(id: string) {
    currentMetaMaskChainIdSettings.value = Number.parseInt(id) as ChainId
}

function onNetworkError(error: any) {
    if (error === 'MetamaskInpageProvider - lost connection to MetaMask') {
        MessageCenter.emit('metamaskMessage', 'metamask_not_install')
        updateExoticWalletFromSource(ProviderType.MetaMask, new Map())
    }
}

// create a new provider
if (Flags.metamask_support_enabled) sideEffect.then(createProvider)

export function createProvider() {
    if (provider) {
        provider.off('data', onData)
        provider.off('networkChanged', onNetworkChanged)
        provider.off('error', onNetworkError)
    }
    provider = createMetaMaskProvider()
    provider.on('data', onData)
    provider.on('networkChanged', onNetworkChanged)
    provider.on('error', onNetworkError)
    return provider
}

export function createWeb3() {
    if (!provider) provider = createProvider()
    if (!web3) web3 = new Web3(provider)
    return web3
}

export async function requestAccounts() {
    const provider = createProvider()
    const web3 = new Web3()
    web3.setProvider(provider)
    const accounts = await web3.eth.requestAccounts()
    await updateWalletInDB(accounts[0] ?? '', true)
    return accounts[0]
}

async function updateWalletInDB(address: string, setAsDefault: boolean = false) {
    // validate address
    if (!EthereumAddress.isValid(address)) throw new Error('Cannot found account or invalid account')

    // update wallet in the DB
    await updateExoticWalletFromSource(ProviderType.MetaMask, new Map([[address, { address }]]))
    if (setDefaultWallet) await setDefaultWallet(address)
}
