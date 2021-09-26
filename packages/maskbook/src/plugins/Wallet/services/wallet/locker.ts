import { currentMaskWalletLockedSettings } from '../../settings'
import * as password from './password'
import { LockStatus } from '@masknet/web3-shared'

export async function isLocked() {
    return (await password.hasPassword()) && !(await password.INTERNAL_getPassword())
}

export async function lockWallet() {
    password.clearPassword()
    currentMaskWalletLockedSettings.value = LockStatus.UNLOCK
}

export async function unlockWallet(unverifiedPassword: string) {
    if (!isLocked()) return true
    try {
        await password.verifyPasswordRequired(unverifiedPassword)
        password.INTERNAL_setPassword(unverifiedPassword)
        currentMaskWalletLockedSettings.value = LockStatus.UNLOCK
        return true
    } catch {
        return false
    }
}
