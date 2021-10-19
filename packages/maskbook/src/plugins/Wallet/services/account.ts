import {
    ChainId,
    getChainIdFromNetworkType,
    getNetworkTypeFromChainId,
    NetworkType,
    ProviderType,
    resolveProviderName,
} from '@masknet/web3-shared-evm'
import { EthereumAddress } from 'wallet.ts'
import {
    currentMaskWalletAccountWalletSettings,
    currentAccountSettings,
    currentChainIdSettings,
    currentMaskWalletChainIdSettings,
    currentMaskWalletNetworkSettings,
    currentNetworkSettings,
    currentProviderSettings,
} from '../settings'
import { Flags, hasNativeAPI, nativeAPI } from '../../../utils'
import { getWallets, hasWallet, updateWallet } from '.'
import { first } from 'lodash-es'

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
    if ((options.account && !options.providerType) || (options.account === undefined && options.providerType))
        throw new Error('Account and provider type must be updating both')

    const { name, account, chainId, providerType, networkType } = options

    // update wallet in the DB
    if (
        account &&
        providerType &&
        EthereumAddress.isValid(account) &&
        providerType !== ProviderType.MaskWallet &&
        !(await hasWallet(account))
    ) {
        await updateWallet(account, {
            name: name || resolveProviderName(providerType),
        })
    }

    // update global settings
    if (chainId) {
        currentChainIdSettings.value = chainId
        if (hasNativeAPI) {
            nativeAPI?.api.wallet_switchBlockChain({ networkId: chainId })
        }
    }
    if (networkType) currentNetworkSettings.value = networkType
    if (account !== undefined) currentAccountSettings.value = account
    if (providerType) currentProviderSettings.value = providerType
    if (currentProviderSettings.value === ProviderType.MaskWallet) {
        await updateMaskAccount({
            account,
            chainId,
            networkType,
        })
    }
}

export async function updateMaskAccount(options: { account?: string; chainId?: ChainId; networkType?: NetworkType }) {
    if (options.chainId && !options.networkType) options.networkType = getNetworkTypeFromChainId(options.chainId)
    if (!options.chainId && options.networkType) options.chainId = getChainIdFromNetworkType(options.networkType)

    const { account, chainId, networkType } = options

    if (chainId) currentMaskWalletChainIdSettings.value = chainId
    if (networkType) currentMaskWalletNetworkSettings.value = networkType
    if (account && EthereumAddress.isValid(account)) currentMaskWalletAccountWalletSettings.value = account
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
    if (providerType === ProviderType.MaskWallet) currentMaskWalletAccountWalletSettings.value = account
    if (chainId) currentChainIdSettings.value = chainId
    if (networkType) currentNetworkSettings.value = networkType
    if (providerType) currentProviderSettings.value = providerType
}

export async function setDefaultWallet() {
    if (currentAccountSettings.value) return
    const wallets = await getWallets()
    const address = first(wallets)?.address
    if (address)
        await updateAccount({
            account: address,
            providerType: ProviderType.MaskWallet,
        })
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
