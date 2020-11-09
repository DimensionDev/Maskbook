import Web3 from 'web3'
import type { provider as Provider } from 'web3-core'
import { first } from 'lodash-es'
import { EthereumAddress } from 'wallet.ts'
import createMetaMaskProvider from 'metamask-extension-provider'
import { ChainId } from '../../../../web3/types'
import { currentMetaMaskChainIdSettings } from '../../../../settings/settings'
import { updateExoticWalletFromSource } from '../../../../plugins/Wallet/services'
import { ProviderType } from '../../../../web3/types'
import {
    currentSelectedWalletAddressSettings,
    currentSelectedWalletProviderSettings,
} from '../../../../plugins/Wallet/settings'

let provider: ReturnType<typeof createMetaMaskProvider> | null = null
let web3: Web3 | null = null

async function onAccountsChanged(accounts: string[]) {
    await updateWalletInDB(first(accounts) ?? '')
}

function onNetworkChanged(id: string) {
    const chainId = Number.parseInt(id, 10) as ChainId
    currentMetaMaskChainIdSettings.value = chainId === 0 ? ChainId.Mainnet : chainId
}

function onError(error: string) {
    if (
        typeof error === 'string' &&
        /Lost Connection to MetaMask/i.test(error) &&
        currentSelectedWalletProviderSettings.value === ProviderType.MetaMask
    )
        currentSelectedWalletAddressSettings.value = ''
}

export function createProvider() {
    if (provider) {
        provider.off('accountsChanged', onAccountsChanged)
        provider.off('networkChanged', onNetworkChanged)
        provider.off('error', onError)
    }
    provider = createMetaMaskProvider()
    provider.on('accountsChanged', onAccountsChanged)
    provider.on('networkChanged', onNetworkChanged)
    provider.on('error', onError)
    return provider
}

// MetaMask provider can be wrapped into web3 lib directly.
// https://github.com/MetaMask/extension-provider
export function createWeb3() {
    provider = createProvider()
    if (!web3) web3 = new Web3(provider as Provider)
    else web3.setProvider(provider as Provider)
    return web3
}

export async function requestAccounts() {
    const web3 = createWeb3()
    const accounts = await web3.eth.requestAccounts()
    await updateWalletInDB(first(accounts) ?? '', true)
    return accounts
}

async function updateWalletInDB(address: string, setAsDefault: boolean = false) {
    const provider_ = currentSelectedWalletProviderSettings.value

    // validate address
    if (!EthereumAddress.isValid(address)) {
        if (provider_ === ProviderType.MetaMask) currentSelectedWalletAddressSettings.value = ''
        return
    }

    // update wallet in the DB
    await updateExoticWalletFromSource(ProviderType.MetaMask, new Map([[address, { address }]]))

    // update the selected wallet provider type
    if (setAsDefault) currentSelectedWalletProviderSettings.value = ProviderType.MetaMask

    // update the selected wallet address
    if (setAsDefault || provider_ === ProviderType.MetaMask) currentSelectedWalletAddressSettings.value = address
}
