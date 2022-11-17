import { PluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { createGlobalSettings } from './createSettings.js'

export enum LockStatus {
    INIT = 0,
    UNLOCK = 1,
    LOCKED = 2,
}

export const currentMaskWalletAccountSettings = createGlobalSettings(`${PluginID.Wallet}+selectedMaskWalletAddress`, '')

export const currentMaskWalletChainIdSettings = createGlobalSettings(
    `${PluginID.Wallet}+maskWalletChainId`,
    ChainId.Mainnet,
)

export const currentMaskWalletLockStatusSettings = createGlobalSettings<LockStatus>(
    `${PluginID.Wallet}+maskWalletLockStatus`,
    LockStatus.INIT,
)
