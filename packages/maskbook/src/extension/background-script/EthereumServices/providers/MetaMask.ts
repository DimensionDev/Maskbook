import Web3 from 'web3'
import type { provider as Provider } from 'web3-core'
import { first } from 'lodash-es'
import { EthereumAddress } from 'wallet.ts'
import createMetaMaskProvider from '@dimensiondev/metamask-extension-provider'
import { ChainId } from '../../../../web3/types'
import { currentMetaMaskChainIdSettings } from '../../../../settings/settings'
import { updateExoticWalletFromSource } from '../../../../plugins/Wallet/services'
import { ProviderType, MetaMaskInpageProvider } from '../../../../web3/types'
import {
    currentSelectedWalletAddressSettings,
    currentSelectedWalletProviderSettings,
    currentIsMetamaskLockedSettings,
} from '../../../../plugins/Wallet/settings'

let provider: MetaMaskInpageProvider | null = null
let web3: Web3 | null = null

async function onAccountsChanged(accounts: string[]) {
    await updateWalletInDB(first(accounts) ?? '')
    currentIsMetamaskLockedSettings.value = !(await provider!._metamask?.isUnlocked()) && accounts.length === 0
}

async function onChainIdChanged(id: string) {
    // learn more: https://docs.metamask.io/guide/ethereum-provider.html#chain-ids and https://chainid.network/
    const chainId = Number.parseInt(id, 16) as ChainId
    currentIsMetamaskLockedSettings.value = !(await provider!._metamask?.isUnlocked())
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

export async function createProvider() {
    if (provider) {
        provider.off('accountsChanged', onAccountsChanged)
        provider.off('chainChanged', onChainIdChanged)
        provider.off('error', onError)
    }
    provider = await createMetaMaskProvider()
    provider.on('accountsChanged', onAccountsChanged as (...args: unknown[]) => void)
    provider.on('chainChanged', onChainIdChanged as (...args: unknown[]) => void)
    provider.on('error', onError as (...args: unknown[]) => void)
    return provider
}

// MetaMask provider can be wrapped into web3 lib directly.
// https://github.com/MetaMask/extension-provider
export async function createWeb3() {
    provider = await createProvider()
    if (!web3) web3 = new Web3(provider as Provider)
    else web3.setProvider(provider as Provider)
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
