import * as password from './password.js'
import { CrossIsolationMessages, LockStatus, currentMaskWalletLockStatusSettings } from '@masknet/shared-base'

export async function isLocked() {
    return (await password.hasPassword()) && !(await password.INTERNAL_getPassword())
}

export async function lockWallet() {
    password.clearPassword()
    currentMaskWalletLockStatusSettings.value = LockStatus.LOCKED
    CrossIsolationMessages.events.walletLockStatusUpdated.sendToAll(true)
}

export async function unlockWallet(unverifiedPassword: string) {
    if (!isLocked()) return true
    try {
        await password.verifyPasswordRequired(unverifiedPassword)
        password.INTERNAL_setPassword(unverifiedPassword)
        currentMaskWalletLockStatusSettings.value = LockStatus.UNLOCK
        CrossIsolationMessages.events.walletLockStatusUpdated.sendToAll(false)
        return true
    } catch (error) {
        CrossIsolationMessages.events.walletLockStatusUpdated.sendToAll(true)
        return false
    }
}
