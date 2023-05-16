/* eslint @masknet/unicode-specific-set: ["error", { "only": "code" }] */
import { encodeText, encodeArrayBuffer } from '@masknet/kit'
import { Ok, type Option, Result } from 'ts-results-es'
import type { PayloadWellFormed, Signature } from '../index.js'
import { CryptoException, PayloadException } from '../types/index.js'
import { encryptWithAES, exportCryptoKeyToJWK } from '../utils/index.js'
import { get_v38PublicSharedCryptoKey } from './shared.js'
import { CheckedError, compressK256Point } from '@masknet/base'

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

    const fields: string[] = ['\u{1F3BC}4/4', AESKeyEncrypted.val, iv, encrypted, signature]

    if (payload.authorPublicKey.some) {
        const compressed = await compressK256Key(payload.authorPublicKey.val.key)
        if (compressed.err) {
            console.error('[@masknet/encryption] An error happened when compressing a secp256k1 key.', compressed.err)
        }
        fields[Index.authorPublicKey] = compressed.unwrapOr('_')
    }
    fields[Index.publicShared] = String(payload.encryption.type === 'public' ? 1 : 0)
    if (payload.author.some) {
        const id = payload.author.val.toText().slice('people:'.length)
        fields[Index.authorIdentifier] = btoa(id)
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

        const jwk = await exportCryptoKeyToJWK(AESKey)
        if (jwk.err) return jwk.mapErr((e) => new CheckedError(CryptoException.InvalidCryptoKey, e))

        // There is no reason that these two steps will fail.
        // Use non-CE version so they're fatal error.
        // ? The original implementation uses JSON.stringify
        // ? and JsonWebKey key order returned by WebCrypto by browsers and NodeJS are different.
        // ? We use the Chrome order to keep the result stable.
        const text = `{"alg":"A256GCM","ext":true,"k":"${jwk.val.k}","key_ops":["decrypt","encrypt"],"kty":"oct"}`
        const ab = encodeText(text)

        const encryptedKey = await encryptWithAES(publicSharedKey.val, iv, ab)
        if (encryptedKey.err) return encryptedKey.mapErr((e) => new CheckedError(CryptoException.EncryptFailed, e))
        return Ok(encodeArrayBuffer(encryptedKey.val.slice()))
    }
}

function encodeSignature(sig: Option<Signature>) {
    if (sig.none) return '_'
    // TODO: should we validate the signee to make sure that it produce a backward compatible signature of the content?
    return encodeArrayBuffer(sig.val.signature.slice())
}

async function compressK256Key(key: CryptoKey) {
    const jwk = await exportCryptoKeyToJWK(key)
    if (jwk.err) return jwk.mapErr((e) => new CheckedError(CryptoException.InvalidCryptoKey, e))
    const arr = (await Result.wrapAsync(() => compressK256Point(jwk.val.x!, jwk.val.y!))).mapErr(
        (e) => new CheckedError(CryptoException.InvalidCryptoKey, e),
    )
    if (arr.err) return arr
    return Ok(encodeArrayBuffer(arr.val.slice()))
}
