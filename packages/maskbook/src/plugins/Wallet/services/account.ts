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

export async function updateAccount(
    options: {
        name?: string
        account?: string
        chainId?: ChainId
        networkType?: NetworkType
        providerType?: ProviderType
    } = {},
) {
    console.debug('DEBUG: update account')
    console.debug(options)

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
    const {
        account = '',
        chainId = ChainId.Mainnet,
        networkType = NetworkType.Ethereum,
        providerType = ProviderType.Maskbook,
    } = options
    currentAccountSettings.value = account
    currentChainIdSettings.value = chainId
    currentNetworkSettings.value = networkType
    currentProviderSettings.value = providerType
}
