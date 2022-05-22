import { first } from 'lodash-unified'
import { defer } from '@dimensiondev/kit'
import type { ChainId, ProviderType } from '@masknet/web3-shared-evm'
import * as MaskWallet from './providers/MaskWallet'
import * as MetaMask from './providers/MetaMask'
import * as WalletConnect from './providers/WalletConnect'
import * as CustomNetwork from './providers/CustomNetwork'
import * as Injected from './providers/Injected'
import * as Fortmatic from './providers/Fortmatic'

// #region connect WalletConnect
// Step 1: Generate the connection URI and render a QRCode for scanning by the user
export async function createConnectionURI() {
    return (await WalletConnect.createConnector()).uri
}

// Step 2: If user confirmed the request we will receive the 'connect' event
type Account = { account?: string; chainId: ChainId }
let deferredConnect: Promise<Account> | null = null
let resolveConnect: ((result: Account) => void) | undefined
let rejectConnect: ((error: Error) => void) | undefined

export async function connectWalletConnect() {
    const [deferred, resolve, reject] = defer<Account>()

    deferredConnect = deferred
    resolveConnect = resolve
    rejectConnect = reject
    createWalletConnect().then(resolve, reject)

    return deferred
}

export async function createWalletConnect() {
    const connector = await WalletConnect.createConnectorIfNeeded()

    if (connector.connected)
        return {
            account: first(connector.accounts),
            chainId: connector.chainId,
        }

    const { accounts, chainId } = await WalletConnect.requestAccounts()
    return {
        account: first(accounts),
        chainId,
    }
}

export async function untilWalletConnect() {
    if (!deferredConnect) throw new Error('No connection.')
    return deferredConnect
}

export async function cancelWalletConnect() {
    rejectConnect?.(new Error('User rejected the request.'))
}
// #endregion

export async function connectMaskWallet(expectedChainId: ChainId) {
    const { accounts, chainId } = await MaskWallet.requestAccounts(expectedChainId)
    return {
        account: first(accounts),
        chainId,
    }
}

export async function connectMetaMask() {
    const { accounts, chainId } = await MetaMask.requestAccounts()
    return {
        account: first(accounts),
        chainId,
    }
}

// #region fortmatic
export async function connectFortmatic(expectedChainId: ChainId) {
    const { accounts, chainId } = await Fortmatic.requestAccounts(expectedChainId)
    return {
        account: first(accounts),
        chainId,
    }
}

export async function disconnectFortmatic(expectedChainId: ChainId) {
    await Fortmatic.dismissAccounts(expectedChainId)
}
// #endregion

export async function connectCustomNetwork() {
    const { accounts, chainId } = await CustomNetwork.requestAccounts()
    return {
        account: first(accounts),
        chainId,
    }
}

// #region connect injected provider
export async function connectInjected() {
    const { accounts, chainId } = await Injected.requestAccounts()
    return {
        account: first(accounts),
        chainId,
    }
}

export async function notifyInjectedEvent(name: string, event: unknown, providerType: ProviderType) {
    switch (name) {
        case 'accountsChanged':
            await Injected.onAccountsChanged(event as string[], providerType)
            break
        case 'chainChanged':
            await Injected.onChainIdChanged(event as string, providerType)
            break
        default:
            throw new Error(`Unknown event name: ${name}.`)
    }
}
// #endregion
