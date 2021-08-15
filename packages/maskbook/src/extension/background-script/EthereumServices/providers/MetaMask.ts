import Web3 from 'web3'
import type { provider as Provider } from 'web3-core'
import { first } from 'lodash-es'
import createMetaMaskProvider, { MetaMaskInpageProvider } from '@dimensiondev/metamask-extension-provider'
import { ChainId, ProviderType } from '@masknet/web3-shared'
import { resetAccount, updateAccount } from '../../../../plugins/Wallet/services'
import {
    currentChainIdSettings,
    currentIsMetaMaskLockedSettings,
    currentProviderSettings,
} from '../../../../plugins/Wallet/settings'

let provider: MetaMaskInpageProvider | null = null
let web3: Web3 | null = null

async function onAccountsChanged(accounts: string[]) {
    await updateIsMetaMaskLockedSettings(accounts)
    if (currentProviderSettings.value !== ProviderType.MetaMask) return

    await updateAccount({
        account: first(accounts),
        providerType: ProviderType.MetaMask,
        chainId: typeof provider?.chainId === 'string' ? Number.parseInt(provider.chainId, 16) : undefined,
        networkType: undefined,
    })
}

async function onChainIdChanged(id: string) {
    await updateIsMetaMaskLockedSettings()
    if (currentProviderSettings.value !== ProviderType.MetaMask) return

    // learn more: https://docs.metamask.io/guide/ethereum-provider.html#chain-ids and https://chainid.network/
    const chainId = Number.parseInt(id, 16) || ChainId.Mainnet
    if (currentChainIdSettings.value === chainId) return
    await updateAccount({
        chainId,
        networkType: undefined,
    })
}

async function onError(error: string) {
    if (typeof error !== 'string' || !error.toLowerCase().includes('Lost Connection to MetaMask'.toLowerCase())) return
    if (currentProviderSettings.value !== ProviderType.MetaMask) return
    await resetAccount({
        providerType: ProviderType.MetaMask,
    })
}

export async function updateIsMetaMaskLockedSettings(accounts: string[] = []) {
    try {
        const unlocked = accounts.length > 0 || await provider?._metamask?.isUnlocked()
        currentIsMetaMaskLockedSettings.value = !unlocked
    } catch {
        currentIsMetaMaskLockedSettings.value = false
    }
}

export function createProvider() {
    if (provider) return provider
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
    const chainId = await web3.eth.getChainId()
    const accounts = await web3.eth.requestAccounts()
    return {
        chainId,
        accounts,
    }
}
