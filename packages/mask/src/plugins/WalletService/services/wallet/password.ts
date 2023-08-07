import { validate } from 'uuid'
import { getDefaultWalletPassword } from '@masknet/shared-base'
import * as database from './database/index.js'
import { i18n } from '../../../../../shared-ui/locales_legacy/index.js'

let inMemoryPassword = ''

export async function INTERNAL_getPassword() {
    const hasSafeSecret = await database.hasSafeSecret()
    return hasSafeSecret
        ? inMemoryPassword
            ? database.decryptSecret(inMemoryPassword)
            : ''
        : database.decryptSecret(getDefaultWalletPassword())
}

export async function INTERNAL_getPasswordRequired() {
    const password_ = await INTERNAL_getPassword()
    if (!password_) throw new Error('No password set yet or expired.')
    return password_
}

export async function INTERNAL_getUnverifiedPassword(unverifiedPassword?: string) {
    if (unverifiedPassword) await verifyPasswordRequired(unverifiedPassword)
    let password_: string = ''

    try {
        password_ = await INTERNAL_getPasswordRequired()
    } catch {
        if (!unverifiedPassword) throw new Error('No password set yet or expired.')
        password_ = await database.decryptSecret(unverifiedPassword)
    }

    return password_
}

export function INTERNAL_setPassword(newPassword: string) {
    validatePasswordRequired(newPassword)
    inMemoryPassword = newPassword
}

export async function resetPassword(newPassword: string) {
    validatePasswordRequired(newPassword)
    await database.resetSecret(newPassword)
    INTERNAL_setPassword(newPassword)
}

export async function setPassword(newPassword: string) {
    validatePasswordRequired(newPassword)
    await database.encryptSecret(newPassword)
    INTERNAL_setPassword(newPassword)
}

export async function setDefaultPassword() {
    const hasSecret = await database.hasSecret()
    if (hasSecret) return
    const password = getDefaultWalletPassword()
    await database.encryptSecret(password)
    INTERNAL_setPassword(password)
}

export async function hasPassword() {
    return database.hasSafeSecret()
}

export async function verifyPassword(unverifiedPassword: string) {
    if (inMemoryPassword === unverifiedPassword) return true
    return validate(await database.decryptSecret(unverifiedPassword))
}

export async function verifyPasswordRequired(unverifiedPassword: string, errorMsg?: string) {
    if (!(await verifyPassword(unverifiedPassword))) throw new Error(errorMsg ?? 'Wrong password')
    return true
}

export async function changePassword(oldPassword: string, newPassword: string) {
    validatePasswordRequired(newPassword)
    await verifyPasswordRequired(oldPassword, 'Incorrect payment password.')
    if (oldPassword === newPassword) throw new Error('Failed to set the same password as the old one.')
    await database.updateSecret(oldPassword, newPassword)
    INTERNAL_setPassword(newPassword)
}

export function validatePassword(unverifiedPassword: string) {
    if (!unverifiedPassword) return false
    if (unverifiedPassword.length < 6) return false
    if (unverifiedPassword.length > 20) return false
    return true
}

export function validatePasswordRequired(unverifiedPassword: string) {
    if (!validatePassword(unverifiedPassword)) throw new Error(i18n.t('popups_wallet_password_satisfied_requirement'))
    return true
}

export function clearPassword() {
    inMemoryPassword = ''
}
