import { decode, encode } from '@msgpack/msgpack'
import { createContainer, parseEncryptedJSONContainer, SupportedVersions } from '../container/index.js'
import { BackupErrors } from '../BackupErrors.js'

export async function encryptBackup(password: BufferSource, binaryBackup: BufferSource) {
    const [pbkdf2IV, AESKey] = await createAESFromPassword(password)
    const AESParam: AesGcmParams = { name: 'AES-GCM', iv: crypto.getRandomValues(new Uint8Array(16)) }

    const encrypted = new Uint8Array(await crypto.subtle.encrypt(AESParam, AESKey, binaryBackup))
    const container = encode([pbkdf2IV, AESParam.iv, encrypted]) as Uint8Array<ArrayBuffer>
    return createContainer(SupportedVersions.Version0, container)
}

export async function decryptBackup(password: BufferSource, data: ArrayBuffer | ArrayLike<number>) {
    const container = await parseEncryptedJSONContainer(SupportedVersions.Version0, data)

    const _ = decode(container)
    if (!Array.isArray(_) || _.length !== 3) throw new TypeError(BackupErrors.UnknownFormat)
    if (!_.every((x): x is Uint8Array => x instanceof Uint8Array)) throw new TypeError(BackupErrors.UnknownFormat)
    const [pbkdf2IV, encryptIV, encrypted] = _

    const aes = await getAESFromPassword(password, pbkdf2IV)

    const AESParam: AesGcmParams = { name: 'AES-GCM', iv: encryptIV }
    const decryptedBackup = await crypto.subtle.decrypt(AESParam, aes, encrypted)
    return decryptedBackup
}

async function createAESFromPassword(password: BufferSource) {
    const pbkdf = await crypto.subtle.importKey('raw', password, 'PBKDF2', false, ['deriveBits', 'deriveKey'])
    const iv = crypto.getRandomValues(new Uint8Array(16))
    const aes = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: iv, iterations: 10000, hash: 'SHA-256' },
        pbkdf,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt'],
    )
    return [iv, aes] as const
}

async function getAESFromPassword(password: BufferSource, iv: Uint8Array) {
    const pbkdf = await crypto.subtle.importKey('raw', password, 'PBKDF2', false, ['deriveBits', 'deriveKey'])
    const aes = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: iv, iterations: 10000, hash: 'SHA-256' },
        pbkdf,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt'],
    )
    return aes
}
