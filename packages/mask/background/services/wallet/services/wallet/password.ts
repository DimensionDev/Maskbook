import { validate } from 'uuid'
import { getDefaultWalletPassword } from '@masknet/shared-base'
import * as database from './database/index.js'

let inMemoryPassword = ''

/** Decrypt the master password and return it. If it fails to decrypt, then return an empty string. */
export async function INTERNAL_getMasterPassword() {
    const hasSafeSecret = await database.hasSafeSecret()
    if (!hasSafeSecret) return database.decryptSecret(getDefaultWalletPassword())
    return inMemoryPassword ? database.decryptSecret(inMemoryPassword) : ''
}

/** Decrypt the master password and return it. If it fails to decrypt, then throw an error. */
export async function INTERNAL_getMasterPasswordRequired() {
    const password_ = await INTERNAL_getMasterPassword()
    if (!password_) throw new Error('No password set yet or expired.')
    return password_
}

export function INTERNAL_setPassword(newPassword: string) {
    validatePasswordRequired(newPassword)
    inMemoryPassword = newPassword
}

/** Force erase the preexisting password and set a new one. */
export async function resetPassword(newPassword: string) {
    validatePasswordRequired(newPassword)
    await database.resetSecret(newPassword)
    INTERNAL_setPassword(newPassword)
}

/** Set a password when no one has set it before. */
export async function setPassword(newPassword: string) {
    validatePasswordRequired(newPassword)
    await database.encryptSecret(newPassword)
    INTERNAL_setPassword(newPassword)
}

/** Set the default password if no secret set before. */
export async function setDefaultPassword() {
    const hasSecret = await database.hasSecret()
    if (hasSecret) return
    const password = getDefaultWalletPassword()
    await database.encryptSecret(password)
    INTERNAL_setPassword(password)
}

/** Clear the verified password in memory forces the user to re-enter the password. */
export async function clearPassword() {
    inMemoryPassword = ''
}

/** Has set a password (could not be the default one). */
export async function hasPassword() {
    return database.hasSafeSecret()
}

/** Has set a password (could be the default one). */
export async function hasDefaultPassword() {
    return database.hasSecret()
}

/** Has a verified password in memory. */
export async function hasVerifiedPassword() {
    return validatePassword(inMemoryPassword)
}

/** Verify the given password. if successful, keep it in memory. */
export async function verifyPassword(unverifiedPassword: string) {
    if (inMemoryPassword === unverifiedPassword) return true
    const valid = validate(await database.decryptSecret(unverifiedPassword))
    if (!valid) return false
    INTERNAL_setPassword(unverifiedPassword)
    return true
}

/** Verify the given password. if successful, keep it in memory; otherwise, throw an error. */
export async function verifyPasswordRequired(unverifiedPassword: string, message?: string) {
    if (!(await verifyPassword(unverifiedPassword))) throw new Error(message ?? 'Wrong password')
    return true
}

export async function changePassword(oldPassword: string, newPassword: string, message?: string) {
    validatePasswordRequired(newPassword)
    await verifyPasswordRequired(oldPassword, message ?? 'Incorrect payment password.')
    if (oldPassword === newPassword) throw new Error('Failed to set the same password as the old one.')
    await database.updateSecret(oldPassword, newPassword)
    INTERNAL_setPassword(newPassword)
}

export async function validatePassword(unverifiedPassword: string) {
    if (!unverifiedPassword) return false
    if (unverifiedPassword.length < 6) return false
    if (unverifiedPassword.length > 20) return false
    return true
}

export async function validatePasswordRequired(unverifiedPassword: string) {
    if (!validatePassword(unverifiedPassword)) throw new Error('The password is not satisfied the requirement.')
    return true
}
