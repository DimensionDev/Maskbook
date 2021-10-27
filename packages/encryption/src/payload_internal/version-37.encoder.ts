import { encode } from '@msgpack/msgpack'
import type { Result } from 'ts-results'
import type { PayloadWellFormed } from '..'
import { exportCryptoKeyToSPKI } from '../utils'

const enum Index {
    version = 0,
    authorNetwork = 1,
    authorID = 2,
    authorPublicKeyAlgorithm = 3,
    authorPublicKey = 4,
    encryption = 5,
    data = 6,
}
export async function encode37(
    payload: PayloadWellFormed.Payload,
    sign: (payload: ArrayBuffer) => Promise<Result<ArrayBuffer, any>>,
) {
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
            console.error(
                `[@masknet/encryption] Failed to encode a public key object into spki format. key is`,
                key,
                'and the error is',
                spki.err,
            )
        }
    }
    if (payload.encryption.type === 'E2E') {
        const { ephemeralPublicKey, iv, ownersAESKeyEncrypted } = payload.encryption
        const subArr = [1, ownersAESKeyEncrypted, iv, Object.fromEntries(ephemeralPublicKey.entries())]
        payload_arr[Index.encryption] = subArr
    } else {
        const { AESKey, iv } = payload.encryption
        const subArr = [0, AESKey, iv]
        payload_arr[Index.encryption] = subArr
    }
    payload_arr[Index.data] = payload.encrypted

    const encoded = encode(payload_arr)
    const sig = await sign(encoded)
    if (sig.err) {
        console.error(`[@masknet/encryption] Failed to sign the payload.`, sig.val)
    }
    return encodeSignatureContainer(encoded, sig.unwrapOr(null))
}

function encodeSignatureContainer(payload: ArrayBuffer, signature: ArrayBuffer | null) {
    const container = [0, payload, signature]
    return encode(container)
}
