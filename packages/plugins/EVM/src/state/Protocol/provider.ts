import { first } from 'lodash-unified'
import { delay } from '@dimensiondev/kit'
import { ChainId, ProviderType } from '@masknet/web3-shared-evm'
import { EnhanceableSite, ExtensionSite } from '@masknet/shared-base'
import { BridgedProvider } from './providers/Bridged'
import { MaskWalletProvider } from './providers/MaskWallet'
import { CustomNetworkProvider } from './providers/CustomNetwork'
import type { Provider } from './types'
import { dismissAccounts, getChainId, requestAccounts } from './network'

const EnhanceableSiteProviders: Record<ProviderType, Provider | null> = {
    [ProviderType.MaskWallet]: new MaskWalletProvider(ProviderType.MaskWallet),
    [ProviderType.MetaMask]: new BridgedProvider(ProviderType.MetaMask),
    [ProviderType.WalletConnect]: new BridgedProvider(ProviderType.WalletConnect),
    [ProviderType.Coin98]: new BridgedProvider(ProviderType.Coin98),
    [ProviderType.WalletLink]: new BridgedProvider(ProviderType.WalletLink),
    [ProviderType.MathWallet]: new BridgedProvider(ProviderType.MathWallet),
    [ProviderType.Fortmatic]: new BridgedProvider(ProviderType.Fortmatic),
    [ProviderType.CustomNetwork]: new CustomNetworkProvider(),
}

const ExtensionSiteProviders: Record<ProviderType, Provider | null> = {
    [ProviderType.MaskWallet]: new MaskWalletProvider(ProviderType.MaskWallet),
    [ProviderType.MetaMask]: new BridgedProvider(ProviderType.MetaMask),
    [ProviderType.WalletConnect]: new BridgedProvider(ProviderType.WalletConnect),
    [ProviderType.Coin98]: null,
    [ProviderType.WalletLink]: null,
    [ProviderType.MathWallet]: null,
    [ProviderType.Fortmatic]: null,
    [ProviderType.CustomNetwork]: new CustomNetworkProvider(),
}

const SiteProviders: Record<EnhanceableSite | ExtensionSite, Record<ProviderType, Provider | null>> = {
    [EnhanceableSite.Localhost]: EnhanceableSiteProviders,
    [EnhanceableSite.Facebook]: EnhanceableSiteProviders,
    [EnhanceableSite.Instagram]: EnhanceableSiteProviders,
    [EnhanceableSite.Twitter]: EnhanceableSiteProviders,
    [EnhanceableSite.Minds]: EnhanceableSiteProviders,
    [EnhanceableSite.OpenSea]: EnhanceableSiteProviders,
    [ExtensionSite.Dashboard]: ExtensionSiteProviders,
    [ExtensionSite.Popup]: ExtensionSiteProviders,
}

export async function createWeb3(
    site: EnhanceableSite | ExtensionSite,
    chainId: ChainId,
    providerType: ProviderType,
    keys: string[] = [],
) {
    const provider = SiteProviders[site][providerType]
    return (
        provider?.createWeb3({
            keys,
            options: {
                site,
                chainId,
            },
        }) ?? null
    )
}

export async function createExternalProvider(
    site: EnhanceableSite | ExtensionSite,
    chainId: ChainId,
    providerType: ProviderType,
    url?: string,
) {
    const provider = SiteProviders[site][providerType]
    return provider?.createExternalProvider({ chainId, url, site })
}

export async function notifyEvent(
    site: EnhanceableSite | ExtensionSite,
    providerType: ProviderType,
    name: string,
    event?: unknown,
) {
    const provider = SiteProviders[site][providerType]

    switch (name) {
        case 'accountsChanged':
            await provider?.onAccountsChanged?.(site, event as string[])
            break
        case 'chainChanged':
            await provider?.onChainChanged?.(site, event as string)
            break
        case 'disconnect':
            await provider?.onDisconnect?.(site)
            break
        default:
            throw new Error(`Unknown event name: ${name}.`)
    }
}

export async function connect({ chainId, providerType }: { chainId: ChainId; providerType: ProviderType }) {
    const account = first(
        await requestAccounts(
            chainId,
            {
                chainId,
            },
            {
                providerType,
            },
        ),
    )

    // the WalletConnect client-side needs more time on waiting for syncing chain id
    if (providerType === ProviderType.WalletConnect) await delay(1000)

    const actualChainId = Number.parseInt(
        await getChainId(
            {
                chainId,
            },
            {
                providerType,
            },
        ),
        16,
    )

    return {
        account,
        chainId: actualChainId,
    }
}

export async function disconnect({ providerType }: { providerType: ProviderType }) {
    await dismissAccounts(
        {},
        {
            providerType,
        },
    )
}
