import { CrossIsolationMessages, PopupRoutes } from '@masknet/shared-base'
import { getAutoLockerDuration } from './database/locker.js'
import * as password from './password.js'
import { hasPopupWindowOpened, openPopupWindow } from '../../../helper/popup-opener.js'

export async function isLocked() {
    return (await password.hasPassword()) && !(await password.hasVerifiedPassword())
}

export async function lockWallet() {
    password.clearPassword()
    CrossIsolationMessages.events.walletLockStatusUpdated.sendToAll(true)
}

export async function unlockWallet(unverifiedPassword: string) {
    if (!isLocked()) return true
    try {
        await password.verifyPasswordRequired(unverifiedPassword)
        CrossIsolationMessages.events.walletLockStatusUpdated.sendToAll(false)
        await setAutoLockTimer()
        return true
    } catch {
        CrossIsolationMessages.events.walletLockStatusUpdated.sendToAll(true)
        return false
    }
}

let pendingRequest: Promise<void> | undefined
export async function requestUnlockWallet(): Promise<void> {
    if (!(await isLocked())) return

    if (!(await hasPopupWindowOpened())) await openPopupWindow(PopupRoutes.WalletUnlock, {})
    pendingRequest ??= new Promise((resolve) => {
        const removeListener = CrossIsolationMessages.events.walletLockStatusUpdated.on((locked) => {
            if (locked) return
            resolve()
            removeListener()
            pendingRequest = undefined
        })
    })
    return pendingRequest
}

// This setTimeout is ok because if the background worker is killed,
// it's the same effect as lockWallet is called.
// eslint-disable-next-line no-restricted-globals
let autoLockTimer: ReturnType<typeof setTimeout> | undefined

export async function setAutoLockTimer(initialTimeout = 0) {
    if (typeof initialTimeout !== 'number' || Number.isNaN(initialTimeout)) initialTimeout = 0
    const autoLockDuration = (await getAutoLockerDuration()) - initialTimeout

    clearTimeout(autoLockTimer)

    if (autoLockDuration <= 0) return

    // eslint-disable-next-line no-restricted-globals
    autoLockTimer = setTimeout(lockWallet, autoLockDuration)
}
