import {
    ChainId,
    getChainIdFromNetworkType,
    getNetworkTypeFromChainId,
    NetworkType,
    ProviderType,
} from '@masknet/web3-shared'
import { EthereumAddress } from 'wallet.ts'
import type { WalletRecord } from '../database/types'
import {
    currentAccountMaskWalletSettings,
    currentAccountSettings,
    currentChainIdSettings,
    currentMaskWalletChainIdSettings,
    currentMaskWalletNetworkSettings,
    currentNetworkSettings,
    currentProviderSettings,
} from '../settings'
import { updateExoticWalletFromSource } from './wallet'
import { Flags, hasNativeAPI, nativeAPI } from '../../../utils'

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

    // make sure account and provider type to be updating both
    if ((options.account && !options.providerType) || (!options.account && options.providerType))
        throw new Error('Account and provider type must be updating both')

    // make sure chain id and network type to be updating both
    // if ((options.chainId && !options.networkType) || (!options.chainId && options.networkType))
    //     throw new Error('Chain id and network type must be updating both')

    const { name, account, chainId, providerType, networkType } = options

    // update wallet in the DB
    if (account && providerType && EthereumAddress.isValid(account) && providerType !== ProviderType.MaskWallet) {
        const updates: Partial<WalletRecord> = { address: account }
        if (name) updates.name = name
        await updateExoticWalletFromSource(providerType, new Map([[account, updates]]))
    }

    // update global settings
    if (chainId) {
        currentChainIdSettings.value = chainId
        if (hasNativeAPI) {
            nativeAPI?.api.wallet_switchBlockChain({ networkId: chainId })
        }
    }
    if (chainId && providerType === ProviderType.MaskWallet) {
        currentMaskWalletChainIdSettings.value = chainId
        if (networkType) currentMaskWalletNetworkSettings.value = networkType
    }
    if (networkType) currentNetworkSettings.value = networkType
    if (account) currentAccountSettings.value = account
    if (account && providerType === ProviderType.MaskWallet) currentAccountMaskWalletSettings.value = account
    if (providerType) currentProviderSettings.value = providerType
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
    if (providerType === ProviderType.MaskWallet) currentAccountMaskWalletSettings.value = account
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
