import { validate } from 'uuid'
import * as database from '../database'
import { i18n } from '../../../../utils'

let password = ''

export async function INTERNAL_getPassword() {
    return password ? database.decryptSecret(password) : ''
}

export async function INTERNAL_getPasswordRequired() {
    const password_ = await INTERNAL_getPassword()
    if (!password_) throw new Error('No password set yet or expired.')
    return password_
}

export function INTERNAL_setPassword(newPassword: string) {
    validatePasswordRequired(newPassword)
    password = newPassword
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
    validatePasswordRequired(unverifiedPassword)
    if (password === unverifiedPassword) return true
    return validate(await database.decryptSecret(unverifiedPassword))
}

export async function verifyPasswordRequired(unverifiedPassword: string) {
    if (!(await verifyPassword(unverifiedPassword))) throw new Error('Wrong password!')
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
    if (unverifiedPassword.length < 8) return false
    if (unverifiedPassword.length > 20) return false
    return [/[A-Z]/, /[a-z]/, /\d/, /[^\dA-Za-z]/].filter((x) => x.test(unverifiedPassword)).length >= 2
}

export function validatePasswordRequired(unverifiedPassword: string) {
    if (!validatePassword(unverifiedPassword)) throw new Error(i18n.t('popups_wallet_password_satisfied_requirement'))
    return true
}

export function clearPassword() {
    password = ''
}
