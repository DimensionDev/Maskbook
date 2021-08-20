import { TypedMessage, makeTypedMessageText, isTypedMessageText } from '../protocols/typed-message'
import type { AESJsonWebKey } from '../modules/CryptoAlgorithm/interfaces/utils'
import { CryptoWorker } from '../modules/workers'
import { encodeArrayBuffer, encodeText } from '../utils'
import { derive_AES_GCM_256_Key_From_PBKDF2 } from '../modules/CryptoAlgorithm/helper'
import { decodeText } from '../utils/type-transform/String-ArrayBuffer'
import { decryptWithAES, encryptWithAES } from './crypto-alpha-40'
export * from './crypto-alpha-39'

// @ts-ignore
export const publicSharedAESKey: AESJsonWebKey = {
    alg: 'A256GCM',
    ext: true,
    k: '3Bf8BJ3ZPSMUM2jg2ThODeLuRRD_-_iwQEaeLdcQXpg',
    key_ops: ['encrypt', 'decrypt'],
    kty: 'oct',
}
/**
 * With plugin: {"payload": "data"}🧩My message
 * Without plugin: My message
 */
export function typedMessageStringify(x: TypedMessage) {
    if (!isTypedMessageText(x)) throw new Error('Not supported typed message.')
    if (!x.meta || x.meta.size === 0) return x.content

    const obj: Record<string, any> = {}
    for (const [a, b] of x.meta) obj[a] = b

    return JSON.stringify(obj) + '🧩' + x.content
}
export function typedMessageParse(x: string) {
    const [maybeMetadata, ...end] = x.split('🧩')
    try {
        const json: unknown = JSON.parse(maybeMetadata)
        if (typeof json !== 'object' || json === null || Object.keys(json).length === 0)
            throw new Error('Not a metadata')
        return makeTypedMessageText(end.join('🧩'), new Map(Object.entries(json)))
    } catch {}
    return makeTypedMessageText(x)
}

//#region Backup
async function getBackupKey(password: string, account: string) {
    const pbkdf2 = await CryptoWorker.import_pbkdf2(encodeText(password + account))
    return derive_AES_GCM_256_Key_From_PBKDF2(pbkdf2, encodeText(account + password))
}

export async function encryptBackup(password: string, account: string, message: string) {
    const aesKey = await getBackupKey(password, account)
    const { content } = await encryptWithAES({ content: message, aesKey, iv: encodeText(account + password) })
    return encodeArrayBuffer(content)
}

export async function decryptBackup(password: string, account: string, message: string) {
    const aesKey = await getBackupKey(password, account)
    const buffer = await decryptWithAES({ encrypted: message as string, aesKey, iv: encodeText(account + password) })

    return decodeText(buffer)
}
//#endregion
