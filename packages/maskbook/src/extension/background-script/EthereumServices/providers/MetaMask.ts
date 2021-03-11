import { first } from 'lodash-es'
import { EthereumAddress } from 'wallet.ts'
import createMetaMaskProvider from '@dimensiondev/metamask-extension-provider'
import { ExternalProvider, Web3Provider } from '@ethersproject/providers'
import { ChainId } from '../../../../web3/types'
import { currentMetaMaskChainIdSettings } from '../../../../settings/settings'
import { updateExoticWalletFromSource } from '../../../../plugins/Wallet/services'
import { ProviderType, MetaMaskInpageProvider } from '../../../../web3/types'
import {
    currentSelectedWalletAddressSettings,
    currentSelectedWalletProviderSettings,
    currentIsMetamaskLockedSettings,
} from '../../../../plugins/Wallet/settings'

let inPageProvider: MetaMaskInpageProvider | null = null
let provider: Web3Provider | null = null

async function onAccountsChanged(accounts: string[]) {
    await updateWalletInDB(first(accounts) ?? '')
    currentIsMetamaskLockedSettings.value = !(await inPageProvider!._metamask?.isUnlocked()) && accounts.length === 0
}

async function onChainIdChanged(id: string) {
    // learn more: https://docs.metamask.io/guide/ethereum-provider.html#chain-ids and https://chainid.network/
    const chainId = Number.parseInt(id, 16)
    currentIsMetamaskLockedSettings.value = !(await inPageProvider!._metamask?.isUnlocked())
    currentMetaMaskChainIdSettings.value = chainId === 0 ? ChainId.Mainnet : chainId
}

function onError(error: string) {
    // TODO:
    // any error is threw if the metamask plugin has got disabled?
    if (
        typeof error === 'string' &&
        /Lost Connection to MetaMask/i.test(error) &&
        currentSelectedWalletProviderSettings.value === ProviderType.MetaMask
    )
        currentSelectedWalletAddressSettings.value = ''
}

async function createInpageProvider() {
    if (inPageProvider) {
        inPageProvider.off('accountsChanged', onAccountsChanged)
        inPageProvider.off('chainChanged', onChainIdChanged)
        inPageProvider.off('error', onError)
    }
    inPageProvider = await createMetaMaskProvider()
    inPageProvider.on('accountsChanged', onAccountsChanged as (...args: unknown[]) => void)
    inPageProvider.on('chainChanged', onChainIdChanged as (...args: unknown[]) => void)
    inPageProvider.on('error', onError as (...args: unknown[]) => void)
    return inPageProvider
}

// MetaMask provider can be wrapped into ethers lib directly.
// https://github.com/MetaMask/extension-provider
export async function createProvider() {
    if (!provider) {
        inPageProvider = await createInpageProvider()
        provider = new Web3Provider((inPageProvider as unknown) as ExternalProvider)
    }
    return provider
}

export async function createSigner() {
    return (await createProvider()).getSigner()
}

export async function requestAccounts() {
    const signer = await createSigner()

    // update accounts
    const address = await signer.getAddress()
    if (address) await updateWalletInDB(address, true)

    // update chain id
    const chainId = await signer.getChainId()
    await onChainIdChanged(chainId.toString(16))

    return address ? [address] : []
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
