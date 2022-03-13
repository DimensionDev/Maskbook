import { first } from 'lodash-unified'
import { ChainId, createLookupTableResolver, ProviderType } from '@masknet/web3-shared-evm'
import { BridgeProvider } from './providers/Bridge'
import { MaskWalletProvider } from './providers/MaskWallet'
import { CustomNetworkProvider } from './providers/CustomNetwork'
import type { Provider } from './types'
import { currentChainIdSettings, currentProviderSettings } from '../../../plugins/Wallet/settings'
import Services from '../../service'
import { WalletRPC } from '../../../plugins/Wallet/messages'

const getProvider = createLookupTableResolver<ProviderType, Provider | null>(
    {
        [ProviderType.MaskWallet]: new MaskWalletProvider(ProviderType.MaskWallet),
        [ProviderType.MetaMask]: new BridgeProvider(ProviderType.MetaMask),
        [ProviderType.WalletConnect]: new BridgeProvider(ProviderType.WalletConnect),
        [ProviderType.Coin98]: new BridgeProvider(ProviderType.Coin98),
        [ProviderType.WalletLink]: new BridgeProvider(ProviderType.WalletLink),
        [ProviderType.MathWallet]: new BridgeProvider(ProviderType.MathWallet),
        [ProviderType.Fortmatic]: new BridgeProvider(ProviderType.Fortmatic),
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

export async function notifyEvent(providerType: ProviderType, name: string, event?: unknown) {
    const provider = getProvider(providerType)

    switch (name) {
        case 'accountsChanged':
            await provider?.onAccountsChanged?.(event as string[])
            break
        case 'chainChanged':
            await provider?.onChainIdChanged?.(event as string)
            break
        case 'disconnect':
            await provider?.onDisconnect?.()
            break
        default:
            throw new Error(`Unknown event name: ${name}.`)
    }
}

export async function connect({ chainId, providerType }: { chainId?: ChainId; providerType: ProviderType }) {
    const account = first(
        await Services.Ethereum.requestAccounts(chainId, {
            chainId,
            providerType,
        }),
    )

    const chainIdRaw = await Services.Ethereum.getChainId({
        providerType,
    })

    console.log('DEBUG: chain id raw')
    console.log({
        chainIdRaw,
    })

    const actualChainId = Number.parseInt(chainIdRaw, 16)
    await WalletRPC.updateAccount({
        account,
        chainId: actualChainId,
        providerType,
    })
    return {
        account,
        chainId: actualChainId,
    }
}

export async function disconnect({ providerType }: { providerType: ProviderType }) {
    await Services.Ethereum.dismissAccounts({
        providerType,
    })
    await WalletRPC.resetAccount()
}
