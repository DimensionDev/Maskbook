import { currentMaskWalletLockStatusSettings } from '../../settings'
import * as password from './password'
import { WalletMessages } from '../../messages'
import { LockStatus } from '../../types'

export async function isLocked() {
    return (await password.hasPassword()) && !(await password.INTERNAL_getPassword())
}

export async function lockWallet() {
    password.clearPassword()
    currentMaskWalletLockStatusSettings.value = LockStatus.LOCKED
    WalletMessages.events.walletLockStatusUpdated.sendToAll(true)
}

export async function unlockWallet(unverifiedPassword: string) {
    if (!isLocked()) return true
    try {
        await password.verifyPasswordRequired(unverifiedPassword)
        password.INTERNAL_setPassword(unverifiedPassword)
        currentMaskWalletLockStatusSettings.value = LockStatus.UNLOCK
        WalletMessages.events.walletLockStatusUpdated.sendToAll(false)
        return true
    } catch {
        WalletMessages.events.walletLockStatusUpdated.sendToAll(true)
        return false
    }
}
