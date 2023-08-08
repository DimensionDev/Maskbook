import { getAutoLockerDuration } from './database/locker.js'
import * as password from './password.js'
import { CrossIsolationMessages, LockStatus, currentMaskWalletLockStatusSettings } from '@masknet/shared-base'

export async function isLocked() {
    return (await password.hasPassword()) && !(await password.INTERNAL_getMasterPassword())
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
        currentMaskWalletLockStatusSettings.value = LockStatus.UNLOCK
        CrossIsolationMessages.events.walletLockStatusUpdated.sendToAll(false)
        return true
    } catch {
        CrossIsolationMessages.events.walletLockStatusUpdated.sendToAll(true)
        return false
    }
}

let autoLockTimer: NodeJS.Timeout | undefined

export async function setAutoLockTimer() {
    const autoLockDuration = await getAutoLockerDuration()

    clearTimeout(autoLockTimer)

    if (autoLockDuration <= 0) return

    autoLockTimer = setTimeout(async () => {
        await lockWallet()
    }, autoLockDuration)
}
