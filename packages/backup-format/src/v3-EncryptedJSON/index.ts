import { encodeText, decodeText } from '@dimensiondev/kit'
import { decode, encode } from '@msgpack/msgpack'
import { createContainer, parseEncryptedJSONContainer } from '../container'
import { BackupErrors } from '../BackupErrors'
import { SupportedVersions } from '../container'
export async function encrypt(key: CryptoKey, backup: unknown) {
    const iv = crypto.getRandomValues(new Uint8Array(16))
    const AESParam: AesGcmParams = { name: 'AES-GCM', iv }

    const binaryBackup = encodeText(JSON.stringify(backup))
    const encrypted = new Uint8Array(await crypto.subtle.encrypt(AESParam, key, binaryBackup))
    const container = encode([iv, encrypted])
    return createContainer(SupportedVersions.Version0, container)
}

export async function decrypt(key: CryptoKey, data: ArrayBuffer) {
    const container = await parseEncryptedJSONContainer(SupportedVersions.Version0, data)

    const _ = decode(container)
    if (!Array.isArray(_) || _.length !== 2) throw new TypeError(BackupErrors.UnknownFormat)
    const [iv, encrypted] = _
    if (!(iv instanceof Uint8Array) || !(encrypted instanceof Uint8Array))
        throw new TypeError(BackupErrors.UnknownFormat)

    const AESParam: AesGcmParams = { name: 'AES-GCM', iv }
    const decryptedBackup = await crypto.subtle.decrypt(AESParam, key, encrypted)
    return JSON.parse(decodeText(decryptedBackup))
}
