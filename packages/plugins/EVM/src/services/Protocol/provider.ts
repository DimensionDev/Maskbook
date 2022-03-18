import { first } from 'lodash-unified'
import { delay } from '@dimensiondev/kit'
import { ChainId, createLookupTableResolver, ProviderType } from '@masknet/web3-shared-evm'
import { BridgedProvider } from './providers/Bridged'
import { MaskWalletProvider } from './providers/MaskWallet'
import { CustomNetworkProvider } from './providers/CustomNetwork'
import type { Provider } from './types'
import { currentChainIdSettings, currentProviderSettings } from '../../../plugins/Wallet/settings'
import { dismissAccounts, getChainId, requestAccounts } from './network'

const getProvider = createLookupTableResolver<ProviderType, Provider | null>(
    {
        [ProviderType.MaskWallet]: new MaskWalletProvider(ProviderType.MaskWallet),
        [ProviderType.MetaMask]: new BridgedProvider(ProviderType.MetaMask),
        [ProviderType.WalletConnect]: new BridgedProvider(ProviderType.WalletConnect),
        [ProviderType.Coin98]: new BridgedProvider(ProviderType.Coin98),
        [ProviderType.WalletLink]: new BridgedProvider(ProviderType.WalletLink),
        [ProviderType.MathWallet]: new BridgedProvider(ProviderType.MathWallet),
        [ProviderType.Fortmatic]: new BridgedProvider(ProviderType.Fortmatic),
        [ProviderType.CustomNetwork]: new CustomNetworkProvider(),
    },
    null,
)

export async function createWeb3(
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

export async function createExternalProvider(
    chainId = currentChainIdSettings.value,
    providerType = currentProviderSettings.value,
    url?: string,
) {
    const provider = getProvider(providerType)
    return provider?.createExternalProvider({ chainId, url })
}

export async function notifyEvent(providerType: ProviderType, name: string, event?: unknown) {
    const provider = getProvider(providerType)

    switch (name) {
        case 'accountsChanged':
            await provider?.onAccountsChanged?.(event as string[])
            break
        case 'chainChanged':
            await provider?.onChainChanged?.(event as string)
            break
        case 'disconnect':
            await provider?.onDisconnect?.()
            break
        default:
            throw new Error(`Unknown event name: ${name}.`)
    }
}

export async function connect({ chainId, providerType }: { chainId: ChainId; providerType: ProviderType }) {
    const account = first(
        await requestAccounts(chainId, {
            chainId,
            providerType,
        }),
    )

    // the WalletConnect client-side needs more time to sync chain id changing
    if (providerType === ProviderType.WalletConnect) await delay(1000)

    const actualChainId = Number.parseInt(
        await getChainId({
            chainId,
            providerType,
        }),
        16,
    )

    return {
        account,
        chainId: actualChainId,
    }
}

export async function disconnect({ providerType }: { providerType: ProviderType }) {
    await dismissAccounts({
        providerType,
    })
}
