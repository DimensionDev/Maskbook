import { compressSecp256k1KeyRaw } from '@masknet/shared-base'
import { Ok } from 'ts-results'
import type { PayloadWellFormed } from '..'
import { EC_KeyCurveEnum } from '../payload/types'
import { encodeMessagePack, exportCryptoKeyToRaw } from '../utils'

// eslint-disable-next-line @dimensiondev/type/no-const-enum
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
    const payload_arr: any[] = [0]

    if (payload.author.some) {
        const { network, userId } = payload.author.val
        payload_arr[Index.authorNetwork] = network
        payload_arr[Index.authorID] = userId
    }
    if (payload.authorPublicKey.some) {
        const { algr, key } = payload.authorPublicKey.val
        payload_arr[Index.authorPublicKeyAlgorithm] = algr
        const raw = await exportCryptoKeyToRaw(key)
        if (raw.ok) {
            if (algr === EC_KeyCurveEnum.secp256k1)
                payload_arr[Index.authorPublicKey] = compressSecp256k1KeyRaw(raw.val)
            else payload_arr[Index.authorPublicKey] = raw.val
        } else {
            payload_arr[Index.authorPublicKey] = null
            warn(key, raw.err)
        }
    }
    if (payload.encryption.type === 'E2E') {
        const { ephemeralPublicKey, iv, ownersAESKeyEncrypted } = payload.encryption
        const keyMaterials: any = {}
        const subArr: any[] = [1, ownersAESKeyEncrypted, iv, keyMaterials]
        for (const [alg, key] of ephemeralPublicKey.entries()) {
            const k = await exportCryptoKeyToRaw(key)
            if (k.err) warn(key, k.err)
            else {
                if (alg === EC_KeyCurveEnum.secp256k1) keyMaterials[alg] = compressSecp256k1KeyRaw(k.val)
                else keyMaterials[alg] = k.val
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
