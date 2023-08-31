import { compressK256KeyRaw } from '@masknet/base'
import { Ok } from 'ts-results-es'
import type { PayloadWellFormed } from '../index.js'
import { EC_KeyCurve } from '../payload/types.js'
import { encodeMessagePack, exportCryptoKeyToRaw } from '../utils/index.js'

const enum Index {
    version = 0,
    authorNetwork = 1,
    authorID = 2,
    authorPublicKeyAlgorithm = 3,
    authorPublicKey = 4,
    encryption = 5,
    data = 6,
}
export async function encode37(payload: PayloadWellFormed.Payload) {
    type KeyMaterials = Partial<Record<EC_KeyCurve, Uint8Array>>
    type AcceptableArray = Array<number | string | Uint8Array | null | Array<KeyMaterials | number | Uint8Array>>

    const payload_arr: AcceptableArray = [0]

    if (payload.author.isSome()) {
        const { network, userId } = payload.author.value
        payload_arr[Index.authorNetwork] = network
        payload_arr[Index.authorID] = userId
    }
    if (payload.authorPublicKey.isSome()) {
        const { algr, key } = payload.authorPublicKey.value
        payload_arr[Index.authorPublicKeyAlgorithm] = algr
        const raw = await exportCryptoKeyToRaw(key)
        if (raw.isOk()) {
            if (algr === EC_KeyCurve.secp256k1) payload_arr[Index.authorPublicKey] = await compressK256KeyRaw(raw.value)
            else payload_arr[Index.authorPublicKey] = raw.value
        } else {
            payload_arr[Index.authorPublicKey] = null
            warn(key, raw.isErr())
        }
    }
    if (payload.encryption.type === 'E2E') {
        const { ephemeralPublicKey, iv, ownersAESKeyEncrypted } = payload.encryption
        const keyMaterials: Partial<Record<EC_KeyCurve, Uint8Array>> = {}
        const subArr: Array<KeyMaterials | number | Uint8Array> = [1, ownersAESKeyEncrypted, iv, keyMaterials]
        for (const [alg, key] of ephemeralPublicKey.entries()) {
            const k = await exportCryptoKeyToRaw(key)
            if (k.isErr()) warn(key, k.isErr())
            else {
                if (alg === EC_KeyCurve.secp256k1) keyMaterials[alg] = await compressK256KeyRaw(k.value)
                else keyMaterials[alg] = k.value
            }
        }
        payload_arr[Index.encryption] = subArr
    } else {
        const { AESKey, iv } = payload.encryption
        const subArr = [0, new Uint8Array(await crypto.subtle.exportKey('raw', AESKey)), iv]
        payload_arr[Index.encryption] = subArr
    }
    payload_arr[Index.data] = payload.encrypted
    return Ok(encodeMessagePack(payload_arr))
}
function warn(key: CryptoKey, err: any) {
    console.warn('[@masknet/encryption] Failed to export public key. key is', key, 'and the error is', err)
}
