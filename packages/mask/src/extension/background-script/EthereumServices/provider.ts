import { first } from 'lodash-es'
import type { ChainId, ProviderType } from '@masknet/web3-shared-evm'
import * as MaskWallet from './providers/Mask'
import * as MetaMask from './providers/MetaMask'
import * as WalletConnect from './providers/WalletConnect'
import * as CustomNetwork from './providers/CustomNetwork'
import * as Injected from './providers/Injected'
import { defer } from '../../../../utils-pure'

//#region connect WalletConnect
// step 1:
// Generate the connection URI and render a QRCode for scanning by the user
export async function createConnectionURI() {
    return (await WalletConnect.createConnector()).uri
}

// step2:
// If user confirmed the request we will receive the 'connect' event
let resolveConnect: ((result: { account?: string; chainId: ChainId }) => void) | undefined
let rejectConnect: ((error: Error) => void) | undefined

export async function connectWalletConnect() {
    const [deferred, resolve, reject] = defer<{ account?: string; chainId: ChainId }>()

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

export async function cancelWalletConnect() {
    rejectConnect?.(new Error('Failed to connect to WalletConnect.'))
}
//#endregion

export async function connectMetaMask() {
    const { accounts, chainId } = await MetaMask.requestAccounts()
    return {
        account: first(accounts),
        chainId,
    }
}

export async function connectMask() {
    const { accounts, chainId } = await MaskWallet.requestAccounts()
    return {
        account: first(accounts),
        chainId,
    }
}

export async function connectCustomNetwork() {
    const { accounts, chainId } = await CustomNetwork.requestAccounts()
    return {
        account: first(accounts),
        chainId,
    }
}

//#region connect injected provider
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
//#endregion
