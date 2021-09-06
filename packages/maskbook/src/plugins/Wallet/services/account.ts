import {
    ChainId,
    ProviderType,
    NetworkType,
    getNetworkTypeFromChainId,
    getChainIdFromNetworkType,
} from '@masknet/web3-shared'
import { EthereumAddress } from 'wallet.ts'
import type { WalletRecord } from '../database/types'
import {
    currentAccountSettings,
    currentChainIdSettings,
    currentNetworkSettings,
    currentProviderSettings,
} from '../settings'
import { updateExoticWalletFromSource } from './wallet'
import { Flags } from '../../../utils'

export async function updateAccount(
    options: {
        name?: string
        account?: string
        chainId?: ChainId
        networkType?: NetworkType
        providerType?: ProviderType
    } = {},
) {
    if (options.chainId && !options.networkType) options.networkType = getNetworkTypeFromChainId(options.chainId)
    if (!options.chainId && options.networkType) options.chainId = getChainIdFromNetworkType(options.networkType)

    const { name, account, chainId, providerType, networkType } = options

    // update wallet in the DB
    if (account && providerType && EthereumAddress.isValid(account) && providerType !== ProviderType.Maskbook) {
        const updates: Partial<WalletRecord> = { address: account }
        if (name) updates.name = name
        await updateExoticWalletFromSource(providerType, new Map([[account, updates]]))
    }

    // update global settings
    if (account) currentAccountSettings.value = account
    if (chainId) currentChainIdSettings.value = chainId
    if (providerType) currentProviderSettings.value = providerType
    if (networkType) currentNetworkSettings.value = networkType
}

export async function resetAccount(
    options: {
        account?: string
        chainId?: ChainId
        networkType?: NetworkType
        providerType?: ProviderType
    } = {},
) {
    const { account = '', chainId, networkType, providerType } = options
    currentAccountSettings.value = account
    if (chainId) currentChainIdSettings.value = chainId
    if (networkType) currentNetworkSettings.value = networkType
    if (providerType) currentProviderSettings.value = providerType
}

export async function getSupportedNetworks() {
    return [
        NetworkType.Ethereum,
        Flags.bsc_enabled ? NetworkType.Binance : undefined,
        Flags.polygon_enabled ? NetworkType.Polygon : undefined,
        Flags.arbitrum_enabled ? NetworkType.Arbitrum : undefined,
        Flags.xdai_enabled ? NetworkType.xDai : undefined,
    ].filter(Boolean) as NetworkType[]
}
