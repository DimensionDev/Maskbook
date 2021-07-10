import { ChainId, ProviderType, NetworkType } from '@masknet/web3-shared'
import {
    currentAccountSettings,
    currentChainIdSettings,
    currentNetworkSettings,
    currentProviderSettings,
} from '../settings'

export async function updateAccount(
    options: {
        account?: string
        chainId?: ChainId
        networkType?: NetworkType
        providerType?: ProviderType
    } = {},
) {
    if (options?.account) currentAccountSettings.value = options?.account
    if (options?.chainId) currentChainIdSettings.value = options?.chainId
    if (options?.providerType) currentProviderSettings.value = options?.providerType
    if (options?.networkType) currentNetworkSettings.value = options?.networkType
}

export async function resetAccount() {
    currentAccountSettings.value = ''
    currentChainIdSettings.value = ChainId.Mainnet
    currentNetworkSettings.value = NetworkType.Ethereum
    currentProviderSettings.value = ProviderType.Maskbook
}
