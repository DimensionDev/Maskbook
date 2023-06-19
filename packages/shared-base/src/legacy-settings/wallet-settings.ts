import { PluginID } from '../Plugin/index.js'
import { createGlobalSettings } from './createSettings.js'

export enum LockStatus {
    INIT = 0,
    UNLOCK = 1,
    LOCKED = 2,
}

export const currentMaskWalletLockStatusSettings = createGlobalSettings<LockStatus>(
    `${PluginID.Wallet}+maskWalletLockStatus`,
    LockStatus.INIT,
)
