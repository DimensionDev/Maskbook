import { validate } from 'uuid'
import * as database from './database'

let password = ''

export function INTERNAL_getPassword() {
    return password
}

export function INTERNAL_getPasswordRequired() {
    if (!password) throw new Error('No password set yet or expired.')
    return password
}

export function INTERNAL_setPassword(newPassword: string) {
    validatePasswordRequired(newPassword)
    password = newPassword
}

export async function setPassword(newPassword: string) {
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
    const oldPassword = INTERNAL_getPasswordRequired()
    if (oldPassword === newPassword) throw new Error('Failed to set the same password as the old one.')
    await database.updateSecret(oldPassword, newPassword)
}

export function validatePassword(unverifiedPassword: string) {
    if (!unverifiedPassword) return false
    if (unverifiedPassword.length < 8) return false
    if (unverifiedPassword.length > 20) return false
    return [/\d/, /[a-z]/i, /[^\da-z]/i].filter((x) => x.test(unverifiedPassword)).length >= 2
}

export function validatePasswordRequired(unverifiedPassword: string) {
    if (!validatePassword(unverifiedPassword)) throw new Error('An invalid password.')
    return true
}

export function clearPassword() {
    password = ''
}
