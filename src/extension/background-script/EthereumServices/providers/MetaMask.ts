import Web3 from 'web3'
import createMetaMaskProvider, { MetamaskInpageProvider } from 'metamask-extension-provider'
import { ChainId } from '../../../../web3/types'
import { currentMetaMaskChainIdSettings } from '../../../../settings/settings'
import { EthereumAddress } from 'wallet.ts'
import { updateExoticWalletFromSource } from '../../../../plugins/Wallet/services'
import { ProviderType } from '../../../../web3/types'
import { MessageCenter } from '../../../../utils/messages'
import { currentSelectedWalletAddressSettings } from '../../../../plugins/Wallet/settings'

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
    currentMetaMaskChainIdSettings.value = Number.parseInt(id, 10) as ChainId
}

function onNetworkError(error: any) {
    if (error === 'MetamaskInpageProvider - lost connection to MetaMask') {
        MessageCenter.emit('metamaskMessage', 'metamask_not_install')
        updateExoticWalletFromSource(ProviderType.MetaMask, new Map())
    }
}

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

// MetaMask provider can be wrapped into web3 lib directly.
// https://github.com/MetaMask/extension-provider
export function createWeb3() {
    provider = createProvider()
    if (!web3) web3 = new Web3(provider)
    else web3.setProvider(provider)
    return web3
}

export async function requestAccounts() {
    const web3 = createWeb3()
    const accounts = await web3.eth.requestAccounts()
    for (const account of accounts) await updateWalletInDB(account, true)
    return accounts
}

async function updateWalletInDB(address: string, setAsDefault: boolean = false) {
    // validate address
    if (!EthereumAddress.isValid(address)) throw new Error('Cannot found account or invalid account')

    // update wallet in the DB
    await updateExoticWalletFromSource(ProviderType.MetaMask, new Map([[address, { address }]]))

    // update the selected wallet address
    if (setAsDefault) currentSelectedWalletAddressSettings.value = address
}
