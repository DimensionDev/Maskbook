import { encodeText, encodeArrayBuffer } from '@dimensiondev/kit'
import { combine, Convert } from 'pvtsutils'
import { Ok, Option, Result } from 'ts-results'
import type { PayloadWellFormed, Signature } from '..'
import { AESAlgorithmEnum } from '../payload'
import { CryptoException, PayloadException } from '../types'
import { encryptWithAES, exportCryptoKeyToJWK } from '../utils'
import { get_v38PublicSharedCryptoKey } from './shared'
import * as secp256k1 from 'tiny-secp256k1'
import { CheckedError } from '@masknet/shared-base'
const { isPoint, pointCompress } = secp256k1

const enum Index {
    authorPublicKey = 5,
    publicShared = 6,
    authorIdentifier = 7,
}
// ? Version 38:🎼4/4|AESKeyEncrypted|iv|encryptedText|signature|authorPublicKey?|publicShared?|authorIdentifier?:||
export async function encode38(payload: PayloadWellFormed.Payload) {
    if (payload.version !== -38) {
        return new CheckedError(PayloadException.UnknownVersion, null).toErr()
    }

    const AESKeyEncrypted = await encodeAESKeyEncrypted(payload.encryption)
    if (AESKeyEncrypted.err) return AESKeyEncrypted
    const iv: string = encodeArrayBuffer(payload.encryption.iv.slice())
    const encrypted: string = encodeArrayBuffer(payload.encrypted.slice())
    const signature: string = encodeSignature(payload.signature)

    const fields: string[] = ['🎼4/4', AESKeyEncrypted.val, iv, encrypted, signature]

    if (payload.authorPublicKey.some) {
        const compressed = await compressSecp256k1Key(payload.authorPublicKey.val.key)
        if (compressed.err) {
            console.error(`[@masknet/encryption] An error happened when compressing a secp256k1 key.`, compressed.err)
        }
        fields[Index.authorPublicKey] = `|${compressed.unwrapOr('_')}`
    }
    fields[Index.publicShared] = String(payload.encryption.type === 'public' ? 1 : 0)
    if (payload.author.some) {
        const id = payload.author.val.userId
        fields[Index.authorIdentifier] = id
    }
    return Ok(fields.join('|') + ':||')
}

async function encodeAESKeyEncrypted(
    encryption: PayloadWellFormed.PublicEncryption | PayloadWellFormed.EndToEndEncryption,
) {
    if (encryption.type === 'E2E') {
        return Ok(encodeArrayBuffer(encryption.ownersAESKeyEncrypted.slice()))
    } else {
        const { AESKey, iv } = encryption
        const publicSharedKey = await get_v38PublicSharedCryptoKey()
        if (publicSharedKey.err) return publicSharedKey

        const jwk = await exportCryptoKeyToJWK(AESKey.key)
        if (jwk.err) return jwk.mapErr((e) => new CheckedError(CryptoException.InvalidCryptoKey, e))

        // There is no reason that these two steps will fail.
        // Use non-CE version so they're fatal error.
        const text = JSON.stringify(jwk.val)
        const ab = encodeText(text)

        const encryptedKey = await encryptWithAES(AESAlgorithmEnum.A256GCM, publicSharedKey.val, iv, ab)
        if (encryptedKey.err) return encryptedKey.mapErr((e) => new CheckedError(CryptoException.EncryptFailed, e))
        return Ok(encodeArrayBuffer(encryptedKey.val.slice()))
    }
}

function encodeSignature(sig: Option<Signature>) {
    if (sig.none) return '_'
    // TODO: should we validate the signee to make sure that it produce a backward compatible signature of the content?
    return encodeArrayBuffer(sig.val.signature.slice())
}

async function compressSecp256k1Key(key: CryptoKey) {
    const jwk = await exportCryptoKeyToJWK(key)
    if (jwk.err) return jwk.mapErr((e) => new CheckedError(CryptoException.InvalidCryptoKey, e))
    const arr = compressSecp256k1Point(jwk.val.x!, jwk.val.y!)
    if (arr.err) return arr
    return Ok(encodeArrayBuffer(arr.val.slice()))
}

/**
 * Compress x & y into a single x
 */
function compressSecp256k1Point(x: string, y: string) {
    return Result.wrap<Uint8Array, CheckedError<CryptoException.InvalidCryptoKey>>(() => {
        const xb = Convert.FromBase64Url(x)
        const yb = Convert.FromBase64Url(y)
        const point = new Uint8Array(combine(new Uint8Array([0x04]), xb, yb))
        if (isPoint(point)) {
            return pointCompress(point, true)
        } else {
            throw new CheckedError(CryptoException.InvalidCryptoKey, 'invalid secp256k1 key')
        }
    })
}
