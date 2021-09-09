import Web3 from 'web3'
import type { provider as Provider } from 'web3-core'
import { first } from 'lodash-es'
import createMetaMaskProvider, { MetaMaskInpageProvider } from '@dimensiondev/metamask-extension-provider'
import { ChainId, ProviderType } from '@masknet/web3-shared'
import { delay } from '@masknet/shared-base'
import { updateAccount } from '../../../../plugins/Wallet/services'
import { currentChainIdSettings, currentProviderSettings } from '../../../../plugins/Wallet/settings'

let provider: MetaMaskInpageProvider | null = null
let web3: Web3 | null = null

async function onAccountsChanged(accounts: string[]) {
    if (currentProviderSettings.value !== ProviderType.MetaMask) return
    await updateAccount({
        account: first(accounts),
        providerType: ProviderType.MetaMask,
        chainId: typeof provider?.chainId === 'string' ? Number.parseInt(provider.chainId, 16) : undefined,
        networkType: undefined,
    })
}

async function onChainIdChanged(id: string) {
    if (currentProviderSettings.value !== ProviderType.MetaMask) return

    // learn more: https://docs.metamask.io/guide/ethereum-provider.html#chain-ids and https://chainid.network/
    const chainId = Number.parseInt(id, 16) || ChainId.Mainnet
    if (currentChainIdSettings.value === chainId) return
    await updateAccount({
        chainId,
        networkType: undefined,
    })
}

export async function createProvider() {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (provider && provider.chainId !== null) return provider
    provider = createMetaMaskProvider()

    // wait for building the connection
    await delay(1000)

    if (!provider || provider.chainId === null) {
        provider = null
        throw new Error('Unable to create provider.')
    }

    provider.on('accountsChanged', onAccountsChanged as (...args: unknown[]) => void)
    provider.on('chainChanged', onChainIdChanged as (...args: unknown[]) => void)
    return provider
}

// MetaMask provider can be wrapped into web3 lib directly.
// https://github.com/MetaMask/extension-provider
export async function createWeb3() {
    const provider_ = (await createProvider()) as Provider
    if (!web3) web3 = new Web3(provider_)
    else web3.setProvider(provider_)
    return web3
}

export async function requestAccounts() {
    const web3 = await createWeb3()
    const chainId = await web3.eth.getChainId()
    const accounts = await web3.eth.requestAccounts()
    return {
        chainId,
        accounts,
    }
}

export async function ensureConnectedAndUnlocked() {
    const web3 = await createWeb3()
    try {
        const accounts = await web3.eth.requestAccounts()
        throw accounts
    } catch (error: string[] | any) {
        const accounts = error
        if (Array.isArray(accounts)) {
            if (accounts.length === 0) throw new Error('MetaMask is locked or it has not connected any accounts.')
            else if (accounts.length > 0) return // valid
        }
        // Any other error means failed to connect MetaMask
        throw new Error('Failed to connect MetaMask.')
    }
}

export async function isUnlocked() {
    try {
        // it's an experimental API. we should not depend on.
        return provider?._metamask?.isUnlocked() ?? false
    } catch {
        return false
    }
}
