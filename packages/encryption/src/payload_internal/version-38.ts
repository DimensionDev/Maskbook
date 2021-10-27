import { Identifier, ProfileIdentifier } from '@masknet/shared-base'
import {
    AESKey,
    AESAlgorithmEnum,
    AsymmetryCryptoKey,
    PayloadParseResult,
    PublicKeyAlgorithmEnum,
    Signature,
} from '../payload'
import { DecodeExceptions, EKinds, OptionalResult, EKindsError as Err } from '../types'
import { Result, Ok, Some } from 'ts-results'
import {
    andThenAsync,
    decodeArrayBufferF,
    decodeTextF,
    decryptWithAES,
    encodeTextF,
    assertIVLengthEq16,
    importAESFromJWK,
    importAsymmetryKeyFromJsonWebKeyOrSPKI,
    JSONParseF,
} from '../utils'
import { Convert } from 'pvtsutils'
import { isPoint, isPointCompressed, pointCompress } from 'tiny-secp256k1'
import type { PayloadParserResult } from '.'

const encodeText = encodeTextF(EKinds.InvalidPayload, EKinds.DecodeFailed)
const decodeArrayBuffer = decodeArrayBufferF(EKinds.InvalidPayload, EKinds.DecodeFailed)
const decodeText = decodeTextF(EKinds.InvalidPayload, EKinds.DecodeFailed)
const JSONParse = JSONParseF(EKinds.InvalidPayload, EKinds.DecodeFailed)
const importEC = Err.withErr(importAsymmetryKeyFromJsonWebKeyOrSPKI, EKinds.InvalidCryptoKey)

// ? Version 38:🎼4/4|AESKeyEncrypted|iv|encryptedText|signature|authorPublicKey?|publicShared?|authorIdentifier?:||
export async function parse38(payload: string): PayloadParserResult {
    //#region Parse text
    const header = '🎼4/4'
    if (!payload.startsWith(header)) return new Err(EKinds.InvalidPayload, 'Unknown version').toErr()
    let rest = payload.slice(header.length)
    // cut the tail
    rest = rest.slice(0, rest.lastIndexOf(':||'))

    const [AESKeyEncrypted, encryptedText, iv, signature, authorPublicKey, authorUserID, sharedPublic] =
        splitFields(rest)
    //#endregion

    //#region Normalization
    const raw_iv = decodeArrayBuffer(iv).andThen(assertIVLengthEq16)
    const raw_aes = decodeArrayBuffer(AESKeyEncrypted)
    const encryption: PayloadParseResult.EndToEndEncryption | PayloadParseResult.PublicEncryption = sharedPublic
        ? {
              type: 'public',
              iv: raw_iv,
              AESKey: await decodePublicSharedAESKey(raw_iv, raw_aes),
          }
        : {
              type: 'E2E',
              iv: raw_iv,
              ephemeralPublicKey: {},
              ownersAESKeyEncrypted: raw_aes,
          }
    const normalized: Readwrite<PayloadParseResult.Payload> = {
        version: -38,
        author: OptionalResult.None,
        authorPublicKey: OptionalResult.None,
        signature: OptionalResult.None,
        encryption: Ok(encryption),
        encrypted: decodeArrayBuffer(encryptedText),
    }
    if (authorUserID) {
        normalized.author = Identifier.fromString(authorUserID, ProfileIdentifier)
            .mapErr(Err.mapErr(EKinds.DecodeFailed))
            .map((e) => Some(e))
    }
    if (authorPublicKey) {
        normalized.authorPublicKey = await decodeECDHPublicKey(authorPublicKey)
    }
    if (signature && raw_iv.ok && raw_aes.ok && normalized.encrypted.ok) {
        const message = encodeText(`4/4|${AESKeyEncrypted}|${iv}|${encryptedText}`)
        const sig = decodeArrayBuffer(signature)
        if (message.ok && sig.ok) {
            normalized.signature = OptionalResult.Some<Signature>({ signee: message.val, signature: sig.val })
        } else if (sig.err) {
            normalized.signature = sig
        } else if (message.err) {
            normalized.signature = message
        }
    }
    return Ok(normalized)
    //#endregion
}

function splitFields(raw: string) {
    const [AESKeyEncrypted = '', encryptedText = '', iv = '', signature, authorPublicKey, authorUserID, sharedPublic] =
        raw.split('|')
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
async function decodePublicSharedAESKey(
    iv: Result<ArrayBuffer, Err<DecodeExceptions>>,
    encryptedKey: Result<ArrayBuffer, Err<DecodeExceptions>>,
): Promise<PayloadParseResult.PublicEncryption['AESKey']> {
    if (iv.err) return iv
    if (encryptedKey.err) return encryptedKey

    const import_AES_GCM_256 = Err.withErr(importAESFromJWK.AES_GCM_256, EKinds.InvalidCryptoKey)
    const decrypt = Err.withErr(decryptWithAES, EKinds.DecodeFailed)

    if (!publicSharedKey) {
        const imported = await import_AES_GCM_256(publicSharedJwk)
        if (imported.err) return imported
        publicSharedKey = imported.val
    }
    const jwk_in_ab = decrypt(AESAlgorithmEnum.AES_GCM_256, publicSharedKey, iv.val, encryptedKey.val)
    const jwk_in_text = andThenAsync(jwk_in_ab, decodeText)
    const jwk = andThenAsync(jwk_in_text, JSONParse)
    const aes = await andThenAsync(jwk, import_AES_GCM_256)

    return aes.map<AESKey>((key) => ({ algr: AESAlgorithmEnum.AES_GCM_256, key }))
}

async function decodeECDHPublicKey(
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
}

function decompressK256Point(point: ArrayBuffer) {
    const p = new Uint8Array(point)
    if (!isPoint(p)) return new Err(EKinds.InvalidCryptoKey, null).toErr()
    const uncompressed: Uint8Array = isPointCompressed(p) ? pointCompress(p, false) : p
    const len = (uncompressed.length - 1) / 2
    const x = uncompressed.slice(1, len + 1)
    const y = uncompressed.slice(len + 1)
    return Ok([Convert.ToBase64Url(x), Convert.ToBase64Url(y)] as readonly [x: string, y: string])
}
