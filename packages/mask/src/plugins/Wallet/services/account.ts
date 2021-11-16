import { first } from 'lodash-es'
import { EthereumAddress } from 'wallet.ts'
import {
    ChainId,
    getChainIdFromNetworkType,
    getNetworkTypeFromChainId,
    InjectedProviderType,
    NetworkType,
    ProviderType,
    resolveProviderName,
} from '@masknet/web3-shared-evm'
import {
    currentMaskWalletAccountSettings,
    currentAccountSettings,
    currentChainIdSettings,
    currentMaskWalletChainIdSettings,
    currentMaskWalletNetworkSettings,
    currentNetworkSettings,
    currentProviderSettings,
    currentInjectedProviderSettings,
} from '../settings'
import { Flags, hasNativeAPI, nativeAPI } from '../../../utils'
import { getWallets, hasWallet, updateWallet } from '.'

export async function updateAccount(
    options: {
        name?: string
        account?: string
        chainId?: ChainId
        networkType?: NetworkType
        providerType?: ProviderType
        injectedProviderType?: InjectedProviderType
    } = {},
) {
    if (options.chainId && !options.networkType) options.networkType = getNetworkTypeFromChainId(options.chainId)
    if (!options.chainId && options.networkType) options.chainId = getChainIdFromNetworkType(options.networkType)

    // make sure account and provider type to be updating both
    if ((options.account && !options.providerType) || (options.account === undefined && options.providerType))
        throw new Error('Account and provider type must be updating both')

    const { name, account, chainId, providerType, networkType, injectedProviderType } = options

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
    if (injectedProviderType) currentInjectedProviderSettings.value = injectedProviderType
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
    if (account && EthereumAddress.isValid(account)) currentMaskWalletAccountSettings.value = account
}

export async function resetAccount(
    options: {
        account?: string
        chainId?: ChainId
        networkType?: NetworkType
        providerType?: ProviderType
        injectedProviderType?: InjectedProviderType
    } = {},
) {
    const { account = '', chainId, networkType, providerType, injectedProviderType } = options
    currentAccountSettings.value = account
    if (providerType === ProviderType.MaskWallet) currentMaskWalletAccountSettings.value = account
    if (chainId) currentChainIdSettings.value = chainId
    if (networkType) currentNetworkSettings.value = networkType
    if (providerType) currentProviderSettings.value = providerType
    if (injectedProviderType) currentInjectedProviderSettings.value = injectedProviderType
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
