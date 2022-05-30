import { EthereumAddress } from 'wallet.ts'
import { ChainId, chainResolver, networkResolver, NetworkType } from '@masknet/web3-shared-evm'
import {
    currentMaskWalletAccountSettings,
    currentMaskWalletChainIdSettings,
    currentMaskWalletNetworkSettings,
} from '../settings'
import { Flags } from '../../../../shared'

export async function updateMaskAccount(options: { account?: string; chainId?: ChainId; networkType?: NetworkType }) {
    if (options.chainId && !options.networkType) options.networkType = chainResolver.chainNetworkType(options.chainId)
    if (!options.chainId && options.networkType) options.chainId = networkResolver.networkChainId(options.networkType)

    const { account, chainId, networkType } = options
    if (chainId) currentMaskWalletChainIdSettings.value = chainId
    if (networkType) currentMaskWalletNetworkSettings.value = networkType
    if (account && EthereumAddress.isValid(account)) currentMaskWalletAccountSettings.value = account
}

export async function resetMaskAccount() {
    currentMaskWalletChainIdSettings.value = ChainId.Mainnet
    currentMaskWalletNetworkSettings.value = NetworkType.Ethereum
    currentMaskWalletAccountSettings.value = ''
}

// #region select wallet with popups
let callbackMemorized: (accounts: string[]) => void | undefined

export async function selectMaskAccountPrepare(callback: (accounts: string[]) => void) {
    callbackMemorized = callback
}

export async function selectMaskAccount(accounts: string[]) {
    callbackMemorized?.(accounts)
}

export async function rejectMaskAccount() {
    callbackMemorized?.([])
}
// #endregion

export async function getSupportedNetworks() {
    return [
        NetworkType.Ethereum,
        Flags.bsc_enabled ? NetworkType.Binance : undefined,
        Flags.polygon_enabled ? NetworkType.Polygon : undefined,
        Flags.arbitrum_enabled ? NetworkType.Arbitrum : undefined,
        Flags.xdai_enabled ? NetworkType.xDai : undefined,
        Flags.celo_enabled ? NetworkType.Celo : undefined,
        Flags.fantom_enabled ? NetworkType.Fantom : undefined,
        Flags.avalanche_enabled ? NetworkType.Avalanche : undefined,
        Flags.aurora_enabled ? NetworkType.Aurora : undefined,
        Flags.harmony_enabled ? NetworkType.Harmony : undefined,
    ].filter(Boolean) as NetworkType[]
}
