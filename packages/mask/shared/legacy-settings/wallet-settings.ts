import { PluginId } from '@masknet/plugin-infra'
import { ChainId, NetworkType } from '@masknet/web3-shared-evm'
import { createGlobalSettings } from './createSettings'

const PLUGIN_ID = PluginId.Wallet
export enum LockStatus {
    INIT = 0,
    UNLOCK = 1,
    LOCKED = 2,
}

export const currentMaskWalletAccountSettings = createGlobalSettings(`${PLUGIN_ID}+selectedMaskWalletAddress`, '')

export const currentMaskWalletChainIdSettings = createGlobalSettings(`${PLUGIN_ID}+maskWalletChainId`, ChainId.Mainnet)

export const currentMaskWalletNetworkSettings = createGlobalSettings<NetworkType>(
    `${PLUGIN_ID}+selectedMaskWalletNetwork`,
    NetworkType.Ethereum,
)

export const currentMaskWalletLockStatusSettings = createGlobalSettings<LockStatus>(
    `${PLUGIN_ID}+maskWalletLockStatus`,
    LockStatus.INIT,
)
