import Web3 from 'web3'
import type { provider as Provider } from 'web3-core'
import { first } from 'lodash-es'
import { EthereumAddress } from 'wallet.ts'
import createMetaMaskProvider, { MetaMaskInpageProvider } from '@dimensiondev/metamask-extension-provider'
import { ChainId, NetworkType, ProviderType } from '@masknet/web3-shared'
import { updateAccount, updateExoticWalletFromSource } from '../../../../plugins/Wallet/services'
import { currentIsMetamaskLockedSettings, currentProviderSettings } from '../../../../plugins/Wallet/settings'

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
    if (currentProviderSettings.value !== ProviderType.MetaMask) return
    await updateAccount({
        chainId,
    })
}

async function onError(error: string) {
    if (typeof error !== 'string' || !/Lost Connection to MetaMask/i.test(error)) return
    if (currentProviderSettings.value !== ProviderType.MetaMask) return
    await updateAccount({
        account: '',
        networkType: NetworkType.Ethereum,
    })
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
export function createWeb3() {
    const provider_ = createProvider() as Provider
    if (!web3) web3 = new Web3(provider_)
    else web3.setProvider(provider_)
    return web3
}

export async function requestAccounts() {
    const web3 = createWeb3()
    const accounts = await web3.eth.requestAccounts()
    const chainId = await web3.eth.getChainId()
    return {
        chainId,
        accounts,
    }
}

async function updateWalletInDB(address: string, chainId?: ChainId, setAsDefault: boolean = false) {
    const providerType = currentProviderSettings.value

    // validate address
    if (!EthereumAddress.isValid(address)) {
        if (providerType === ProviderType.MetaMask) await updateAccount({ account: '' })
        return
    }

    // update wallet in the DB
    await updateExoticWalletFromSource(ProviderType.MetaMask, new Map([[address, { address }]]))

    // update chain account
    await updateAccount({
        account: setAsDefault || providerType === ProviderType.MetaMask ? address : undefined,
        chainId,
        providerType: setAsDefault ? ProviderType.MetaMask : undefined,
    })
}
