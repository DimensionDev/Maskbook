import { first } from 'lodash-unified'
import { defer } from '@dimensiondev/kit'
import { ChainId, createLookupTableResolver, ProviderType } from '@masknet/web3-shared-evm'
import { InjectedProvider } from './providers/Injected'
import { MaskWalletProvider } from './providers/MaskWallet'
import { WalletConnectProvider } from './providers/WalletConnect'
import { CustomNetworkProvider } from './providers/CustomNetwork'
import { FortmaticProvider } from './providers/Fortmatic'
import type { Provider } from './types'
import { currentChainIdSettings, currentProviderSettings } from '../../../plugins/Wallet/settings'

const getProvider = createLookupTableResolver<ProviderType, Provider | null>(
    {
        [ProviderType.MaskWallet]: new MaskWalletProvider(),
        [ProviderType.MetaMask]: new InjectedProvider(ProviderType.MetaMask),
        [ProviderType.WalletConnect]: new WalletConnectProvider(),
        [ProviderType.Coin98]: new InjectedProvider(ProviderType.Coin98),
        [ProviderType.WalletLink]: new InjectedProvider(ProviderType.WalletLink),
        [ProviderType.MathWallet]: new InjectedProvider(ProviderType.MathWallet),
        [ProviderType.Fortmatic]: new FortmaticProvider(),
        [ProviderType.CustomNetwork]: new CustomNetworkProvider(),
    },
    null,
)

export function createWeb3(
    chainId = currentChainIdSettings.value,
    providerType = currentProviderSettings.value,
    keys: string[] = [],
) {
    const provider = getProvider(providerType)
    return (
        provider?.createWeb3({
            keys,
            options: {
                chainId,
            },
        }) ?? null
    )
}

export function createExternalProvider(
    chainId = currentChainIdSettings.value,
    providerType = currentProviderSettings.value,
    url?: string,
) {
    const provider = getProvider(providerType)
    return provider?.createExternalProvider({ chainId, url })
}

export async function connect({
    chainId = currentChainIdSettings.value,
    providerType = currentProviderSettings.value,
}: {
    chainId?: ChainId
    providerType?: ProviderType
} = {}) {
    const provider = getProvider(providerType)
    const response = await provider?.requestAccounts?.(chainId)
    return {
        account: first(response?.accounts),
        chainId: response?.chainId,
    }
}

export async function disconnect({
    chainId = currentChainIdSettings.value,
    providerType = currentProviderSettings.value,
}: {
    chainId?: ChainId
    providerType?: ProviderType
} = {}) {
    const provider = getProvider(providerType)
    await provider?.dismissAccounts?.(chainId)
}

// #region connect WalletConnect
// step 1:
// Generate the connection URI and render a QRCode for scanning by the user
export async function createConnectionURI() {
    const provider = getProvider(ProviderType.WalletConnect) as WalletConnectProvider
    return (await provider.createConnector()).uri
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
    const provider = getProvider(ProviderType.WalletConnect) as WalletConnectProvider
    const connector = await provider.createConnectorIfNeeded()
    if (connector.connected)
        return {
            account: first(connector.accounts),
            chainId: connector.chainId,
        }

    const { accounts, chainId } = await provider.requestAccounts()
    return {
        account: first(accounts),
        chainId,
    }
}

export async function cancelWalletConnect() {
    rejectConnect?.(new Error('Failed to connect to WalletConnect.'))
}
// #endregion

//#region connect injected provider
export async function notifyEvent(providerType: ProviderType, name: string, event: unknown) {
    const provider = getProvider(providerType)

    switch (name) {
        case 'accountsChanged':
            await provider?.onAccountsChanged?.(event as string[])
            break
        case 'chainChanged':
            await provider?.onChainIdChanged?.(event as string)
            break
        default:
            throw new Error(`Unknown event name: ${name}.`)
    }
}
// #endregion
