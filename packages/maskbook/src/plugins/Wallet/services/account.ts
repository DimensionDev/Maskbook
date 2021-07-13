import {
    ChainId,
    ProviderType,
    NetworkType,
    getNetworkTypeFromChainId,
    getChainIdFromNetworkType,
} from '@masknet/web3-shared'
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
    console.debug('DEBUG: update account')
    console.debug(options)
    if (!options?.chainId && options.networkType) options.chainId = getChainIdFromNetworkType(options.networkType)
    if (options?.chainId && !options?.networkType) options.networkType = getNetworkTypeFromChainId(options.chainId)
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
