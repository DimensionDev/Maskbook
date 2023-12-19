import {
    CrossIsolationMessages,
    LockStatus,
    PopupRoutes,
    currentMaskWalletLockStatusSettings,
} from '@masknet/shared-base'
import { getAutoLockerDuration } from './database/locker.js'
import * as password from './password.js'
import { openPopupWindow } from '../../../helper/popup-opener.js'

export async function isLocked() {
    return (await password.hasPassword()) && !(await password.hasVerifiedPassword())
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
        await setAutoLockTimer()
        return true
    } catch {
        CrossIsolationMessages.events.walletLockStatusUpdated.sendToAll(true)
        return false
    }
}

export async function requestUnlockWallet(): Promise<void> {
    if (!(await isLocked())) return
    await openPopupWindow(PopupRoutes.WalletUnlock, {})
    return new Promise((resolve) => {
        CrossIsolationMessages.events.walletLockStatusUpdated.on((locked) => {
            if (!locked) resolve()
        })
    })
}

let autoLockTimer: ReturnType<typeof setTimeout> | undefined

export async function setAutoLockTimer() {
    const autoLockDuration = await getAutoLockerDuration()

    clearTimeout(autoLockTimer)

    if (autoLockDuration <= 0) return

    autoLockTimer = setTimeout(async () => {
        await lockWallet()
    }, autoLockDuration)
}
