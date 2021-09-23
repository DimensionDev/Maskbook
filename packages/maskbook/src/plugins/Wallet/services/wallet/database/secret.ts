import { v4 as uuid } from 'uuid'
import { decodeText, encodeText } from '@dimensiondev/kit'
import { PluginDB } from '../../../database/Plugin.db'

const SECRET_ID = '0'

function derivePBKDF2(password: string) {
    return crypto.subtle.importKey('raw', encodeText(password), 'PBKDF2', false, ['deriveBits', 'deriveKey'])
}
function deriveAES(key: CryptoKey, iv: ArrayBuffer) {
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: iv,
            iterations: 100000,
            hash: 'SHA-256',
        },
        key,
        { name: 'AES-KW', length: 256 },
        false,
        ['encrypt', 'decrypt'],
    )
}
function encrypt(message: ArrayBuffer, key: CryptoKey, iv: ArrayBuffer) {
    return crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, message)
}
function decrypt(message: ArrayBuffer, key: CryptoKey, iv: ArrayBuffer) {
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, message)
}
function getIV() {
    return crypto.getRandomValues(new Uint8Array(16))
}
async function deriveKey(iv: ArrayBuffer, password: string) {
    return deriveAES(await derivePBKDF2(password), iv)
}

export async function getSecret() {
    return PluginDB.get('secret', SECRET_ID)
}

export async function hasSecret() {
    return !!(await getSecret())
}

export async function encryptSecret(password: string) {
    const secret = await getSecret()
    if (secret) throw new Error('Failed to encrypt secret.')

    const iv = getIV()
    const key = await deriveKey(iv, password)
    const message = uuid() // the primary key never change
    await PluginDB.add({
        id: SECRET_ID,
        type: 'secret',
        iv,
        encrypted: await encrypt(encodeText(message), key, iv),
    })
}

export async function updateSecret(oldPassword: string, newPassword: string) {
    const secret = await getSecret()
    if (!secret) throw new Error('Failed to update secret.')

    const iv = getIV()
    const message = await decryptSecret(oldPassword)
    const key = await deriveKey(iv, newPassword)
    await PluginDB.add({
        id: SECRET_ID,
        type: 'secret',
        iv,
        encrypted: await encrypt(encodeText(message), key, iv),
    })
}

export async function decryptSecret(password: string) {
    const secret = await getSecret()
    if (!secret) throw new Error('Failed to decrypt secret.')

    const key = await deriveKey(secret.iv, password)
    return decodeText(await decrypt(secret.encrypted, key, secret.iv))
}
