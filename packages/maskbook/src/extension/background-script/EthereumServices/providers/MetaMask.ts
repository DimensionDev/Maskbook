import Web3 from 'web3'
import type { provider as Provider } from 'web3-core'
import { first } from 'lodash-es'
import { EthereumAddress } from 'wallet.ts'
import createMetaMaskProvider, { MetaMaskInpageProvider } from '@dimensiondev/metamask-extension-provider'
import { ChainId, getNetworkTypeFromChainId, ProviderType } from '@dimensiondev/web3-shared'
import { updateExoticWalletFromSource } from '../../../../plugins/Wallet/services'
import {
    currentMetaMaskChainIdSettings,
    currentSelectedWalletAddressSettings,
    currentSelectedWalletProviderSettings,
    currentIsMetamaskLockedSettings,
    currentSelectedWalletNetworkSettings,
} from '../../../../plugins/Wallet/settings'

let provider: MetaMaskInpageProvider | null = null
let web3: Web3 | null = null

async function onAccountsChanged(accounts: string[]) {
    await updateWalletInDB(first(accounts) ?? '')
    currentIsMetamaskLockedSettings.value = !(await provider!._metamask?.isUnlocked()) && accounts.length === 0
}

async function onChainIdChanged(id: string) {
    // learn more: https://docs.metamask.io/guide/ethereum-provider.html#chain-ids and https://chainid.network/
    const chainId_ = Number.parseInt(id, 16)
    const chainId = chainId_ === 0 ? ChainId.Mainnet : chainId_
    currentIsMetamaskLockedSettings.value = !(await provider!._metamask?.isUnlocked())
    currentMetaMaskChainIdSettings.value = chainId
    currentSelectedWalletNetworkSettings.value = getNetworkTypeFromChainId(chainId)
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
        provider.off('chainChanged', onChainIdChanged)
        provider.off('error', onError)
    }
    provider = createMetaMaskProvider()
    if (!provider) throw new Error('Unable to create in page provider.')
    provider.on('accountsChanged', onAccountsChanged as (...args: unknown[]) => void)
    provider.on('chainChanged', onChainIdChanged as (...args: unknown[]) => void)
    provider.on('error', onError as (...args: unknown[]) => void)
    return provider
}

// MetaMask provider can be wrapped into web3 lib directly.
// https://github.com/MetaMask/extension-provider
export async function createWeb3() {
    const provider_ = createProvider() as Provider
    if (!web3) web3 = new Web3(provider_)
    else web3.setProvider(provider_)
    return web3
}

export async function requestAccounts() {
    const web3 = await createWeb3()

    // update accounts
    const accounts = await web3.eth.requestAccounts()
    await updateWalletInDB(first(accounts) ?? '', true)

    // update chain id
    const chainId = await web3.eth.getChainId()
    onChainIdChanged(chainId.toString(16))

    return accounts
}

async function updateWalletInDB(address: string, setAsDefault: boolean = false) {
    const providerType = currentSelectedWalletProviderSettings.value

    // validate address
    if (!EthereumAddress.isValid(address)) {
        if (providerType === ProviderType.MetaMask) currentSelectedWalletAddressSettings.value = ''
        return
    }

    // update wallet in the DB
    await updateExoticWalletFromSource(ProviderType.MetaMask, new Map([[address, { address }]]))

    // update the selected wallet provider type
    if (setAsDefault) currentSelectedWalletProviderSettings.value = ProviderType.MetaMask

    // update the selected wallet address
    if (setAsDefault || providerType === ProviderType.MetaMask) currentSelectedWalletAddressSettings.value = address
}
