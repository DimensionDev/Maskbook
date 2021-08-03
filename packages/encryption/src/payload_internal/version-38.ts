import { Identifier, ProfileIdentifier } from '@masknet/shared-base'
import {
    AESKey,
    AESKeyParameterEnum,
    AsymmetryCryptoKey,
    PayloadParseResult,
    PublicKeyAlgorithmEnum,
    Signature,
} from '../payload'
import { DecodeExceptions, ExceptionKinds, OptionalResult, Exception } from '../types'
import { Result, Ok, Some } from 'ts-results'
import {
    andThenAsync,
    decodeArrayBufferF,
    decodeTextF,
    decryptWithAES,
    encodeTextF,
    ensureIVLength16,
    importAESFromJWK,
    importAsymmetryKeyFromJsonWebKeyOrSPKI,
    JSONParseF,
} from '../utils'
import { Convert } from 'pvtsutils'
import { isPoint, isPointCompressed, pointCompress } from 'tiny-secp256k1'
import type { PayloadParserResult } from '.'

const encodeText = encodeTextF(ExceptionKinds.InvalidPayload, ExceptionKinds.DecodeFailed)
const decodeArrayBuffer = decodeArrayBufferF(ExceptionKinds.InvalidPayload, ExceptionKinds.DecodeFailed)
const decodeText = decodeTextF(ExceptionKinds.InvalidPayload, ExceptionKinds.DecodeFailed)
const JSONParse = JSONParseF(ExceptionKinds.InvalidPayload, ExceptionKinds.DecodeFailed)
const importEC = Exception.withErr(importAsymmetryKeyFromJsonWebKeyOrSPKI, ExceptionKinds.InvalidCryptoKey)

// ? Version 38:🎼4/4|AESKeyEncrypted|iv|encryptedText|signature|authorPublicKey?|publicShared?|authorIdentifier?:||
export async function parse38(payload: string): PayloadParserResult {
    //#region Parse text
    if (!payload.startsWith('🎼4/4')) return new Exception(ExceptionKinds.InvalidPayload, 'Unknown version').toErr()
    let rest = payload.slice(6)
    // cut the tail
    rest = rest.slice(0, rest.lastIndexOf(':||'))

    const [AESKeyEncrypted, encryptedText, iv, signature, authorPublicKey, authorUserID, sharedPublic] = split(rest)
    //#endregion

    //#region Normalization
    const raw_iv = decodeArrayBuffer(iv).andThen(ensureIVLength16)
    const raw_aes = decodeArrayBuffer(AESKeyEncrypted)
    const encryption: PayloadParseResult.EndToEndEncryption | PayloadParseResult.PublicEncryption = sharedPublic
        ? {
              type: 'public',
              iv: raw_iv,
              AESKey: await getPublicSharedAESKey(raw_iv, raw_aes),
          }
        : {
              type: 'E2E',
              iv: raw_iv,
              ephemeralPublicKey: {},
              ownersAESKeyEncrypted: raw_aes,
          }
    const normalized: PayloadParseResult.Payload = {
        version: -38,
        author: OptionalResult.None,
        authorPublicKey: OptionalResult.None,
        signature: OptionalResult.None,
        encryption: Ok(encryption),
        encrypted: decodeArrayBuffer(encryptedText),
    }
    if (authorUserID) {
        normalized.author = Identifier.fromString(authorUserID, ProfileIdentifier)
            .mapErr(Exception.mapErr(ExceptionKinds.DecodeFailed))
            .map((e) => Some(e))
    }
    if (authorPublicKey) {
        normalized.authorPublicKey = await decodeECDHKey(authorPublicKey)
    }
    if (signature && raw_iv.ok && raw_aes.ok && normalized.encrypted.ok) {
        const message = encodeText(`4/4|${AESKeyEncrypted}|${iv}|${encryptedText}`)
        const sig = decodeArrayBuffer(signature)
        if (message.ok && sig.ok) {
            normalized.signature = OptionalResult.Some<Signature>([message.val, sig.val])
        } else if (sig.err) {
            normalized.signature = sig
        } else if (message.err) {
            normalized.signature = message
        }
    }
    return Ok(normalized)
    //#endregion
}

function split(x: string) {
    const [AESKeyEncrypted = '', encryptedText = '', iv = '', signature, authorPublicKey, authorUserID, sharedPublic] =
        x.split('|')
    return [
        AESKeyEncrypted,
        encryptedText,
        iv,
        // "_" is used as placeholder
        (signature === '_' ? undefined : signature) as string | undefined,
        authorPublicKey as string | undefined,
        authorUserID as string | undefined,
        sharedPublic === '1' ? true : false,
    ] as const
}

// In payload version 38, the AES key is encrypted by this key.
const publicSharedJwk: JsonWebKey = {
    alg: 'A256GCM',
    ext: true,
    k: '3Bf8BJ3ZPSMUM2jg2ThODeLuRRD_-_iwQEaeLdcQXpg',
    key_ops: ['encrypt', 'decrypt'],
    kty: 'oct',
}
let publicSharedKey: CryptoKey
async function getPublicSharedAESKey(
    iv: Result<ArrayBuffer, Exception<DecodeExceptions>>,
    encryptedKey: Result<ArrayBuffer, Exception<DecodeExceptions>>,
): Promise<PayloadParseResult.PublicEncryption['AESKey']> {
    if (iv.err) return iv
    if (encryptedKey.err) return encryptedKey

    const import_AES_GCM_256 = Exception.withErr(importAESFromJWK.AES_GCM_256, ExceptionKinds.InvalidCryptoKey)
    const decrypt = Exception.withErr(decryptWithAES, ExceptionKinds.DecodeFailed)

    if (!publicSharedKey) {
        const imported = await import_AES_GCM_256(publicSharedJwk)
        if (imported.err) return imported
        publicSharedKey = imported.val
    }
    const jwk_in_ab = decrypt(AESKeyParameterEnum.AES_GCM_256, publicSharedKey, iv.val, encryptedKey.val)
    const jwk_in_text = andThenAsync(jwk_in_ab, decodeText)
    const jwk = andThenAsync(jwk_in_text, JSONParse)
    const aes = await andThenAsync(jwk, import_AES_GCM_256)

    return aes.map<AESKey>((key) => [AESKeyParameterEnum.AES_GCM_256, key])
}

async function decodeECDHKey(
    compressedPublic: string,
): Promise<OptionalResult<AsymmetryCryptoKey, PayloadParseResult.CryptoKeyException>> {
    const key = decodeArrayBuffer(compressedPublic).andThen(decompressK256Point)

    if (key.err) return key
    const [x, y] = key.val
    const jwk: JsonWebKey = {
        crv: 'K-256',
        ext: true,
        x,
        y,
        key_ops: ['deriveKey', 'deriveBits'],
        kty: 'EC',
    }
    const imported = await importEC(jwk, PublicKeyAlgorithmEnum.secp256k1)
    if (imported.err) return imported
    return OptionalResult.Some([PublicKeyAlgorithmEnum.secp256k1, imported.val])

    function decompressK256Point(point: ArrayBuffer) {
        const p = Buffer.from(point)
        if (!isPoint(p)) return new Exception(ExceptionKinds.InvalidCryptoKey, null).toErr()
        const uncompressed: Uint8Array = isPointCompressed(p) ? pointCompress(p, false) : p
        const len = (uncompressed.length - 1) / 2
        const x = uncompressed.slice(1, len + 1)
        const y = uncompressed.slice(len + 1)
        return Ok([Convert.ToBase64Url(x), Convert.ToBase64Url(y)])
    }
}
