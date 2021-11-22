import { Ok } from 'ts-results'
import type { PayloadWellFormed } from '..'
import { encodeMessagePack, exportCryptoKeyToSPKI } from '../utils'

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
    const payload_arr: any[] = [-37]

    if (payload.author.some) {
        const { network, userId } = payload.author.val
        payload_arr[Index.authorNetwork] = network
        payload_arr[Index.authorID] = userId
    }
    if (payload.authorPublicKey.some) {
        const { algr, key } = payload.authorPublicKey.val
        payload_arr[Index.authorPublicKeyAlgorithm] = algr
        const spki = await exportCryptoKeyToSPKI(key)
        if (spki.ok) {
            payload_arr[Index.authorPublicKey] = spki.val
        } else {
            payload_arr[Index.authorPublicKey] = null
            warn(key, spki.err)
        }
    }
    if (payload.encryption.type === 'E2E') {
        const { ephemeralPublicKey, iv, ownersAESKeyEncrypted } = payload.encryption
        const keyMaterials: any = {}
        const subArr: any[] = [1, ownersAESKeyEncrypted, iv, keyMaterials]
        for (const [alg, key] of ephemeralPublicKey.entries()) {
            const k = await exportCryptoKeyToSPKI(key)
            if (k.err) warn(key, k.err)
            else keyMaterials[alg] = k.val
        }
        payload_arr[Index.encryption] = subArr
    } else {
        const { AESKey, iv } = payload.encryption
        const subArr = [0, [AESKey.algr, (await crypto.subtle.exportKey('jwk', AESKey.key)).k], iv]
        payload_arr[Index.encryption] = subArr
    }
    payload_arr[Index.data] = payload.encrypted
    return Ok(encodeMessagePack(payload_arr))
}
function warn(key: CryptoKey, err: any) {
    console.warn(
        `[@masknet/encryption] Failed to encode a public key object into spki format. key is`,
        key,
        'and the error is',
        err,
    )
}
