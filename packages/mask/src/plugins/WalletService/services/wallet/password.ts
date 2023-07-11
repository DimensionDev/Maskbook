import { validate } from 'uuid'
import * as database from './database/index.js'
import { i18n } from '../../../../../shared-ui/locales_legacy/index.js'
import { getDefaultPassword } from '../helpers.js'

let inMemoryPassword = ''

export async function INTERNAL_getPassword() {
    return inMemoryPassword ? database.decryptSecret(inMemoryPassword) : ''
}

export async function INTERNAL_getPasswordRequired() {
    if (await hasPassword()) {
        const password_ = await INTERNAL_getPassword()
        if (!password_) throw new Error('No password set yet or expired.')
        return password_
    } else {
        return getDefaultPassword()
    }
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

export async function hasPassword() {
    return database.hasSecret()
}

export async function verifyPassword(unverifiedPassword: string) {
    if (inMemoryPassword === unverifiedPassword) return true
    return validate(await database.decryptSecret(unverifiedPassword))
}

export async function verifyPasswordRequired(unverifiedPassword: string) {
    if (!(await verifyPassword(unverifiedPassword))) throw new Error('Wrong password')
    return true
}

export async function changePassword(newPassword: string) {
    validatePasswordRequired(newPassword)
    const oldPassword = await INTERNAL_getPasswordRequired()
    if (oldPassword === newPassword) throw new Error('Failed to set the same password as the old one.')
    await database.updateSecret(oldPassword, newPassword)
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
