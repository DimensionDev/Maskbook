import { PluginID } from '@masknet/shared-base'
import { ChainId, NetworkType } from '@masknet/web3-shared-evm'
import { createGlobalSettings } from './createSettings.js'

const PLUGIN_ID = PluginID.Wallet
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
