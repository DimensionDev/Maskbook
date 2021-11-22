import {
    AESKey,
    AESAlgorithmEnum,
    AsymmetryCryptoKey,
    PayloadParseResult,
    PublicKeyAlgorithmEnum,
    Signature,
} from '../payload'
import { CryptoException, PayloadException, OptionalResult, EKindsError as Err } from '../types'
import { Result, Ok, Some } from 'ts-results'
import {
    andThenAsync,
    decodeUint8ArrayF,
    decodeTextF,
    decryptWithAES,
    assertIVLengthEq16,
    importAESFromJWK,
    importAsymmetryKeyFromJsonWebKeyOrSPKI,
    JSONParseF,
} from '../utils'
import { Convert } from 'pvtsutils'
import { isPoint, isPointCompressed, pointCompress } from 'tiny-secp256k1'
import type { PayloadParserResult } from '.'
import { get_v38PublicSharedCryptoKey } from './shared'
import { encodeText } from '@dimensiondev/kit'
import { Identifier, ProfileIdentifier } from '@masknet/shared-base'

const decodeUint8Array = decodeUint8ArrayF(PayloadException.InvalidPayload, PayloadException.DecodeFailed)
const decodeUint8ArrayCrypto = decodeUint8ArrayF(CryptoException.InvalidCryptoKey, CryptoException.InvalidCryptoKey)
const decodeTextCrypto = decodeTextF(CryptoException.InvalidCryptoKey, CryptoException.InvalidCryptoKey)
const JSONParse = JSONParseF(CryptoException.InvalidCryptoKey, CryptoException.InvalidCryptoKey)
const importEC = Err.withErr(importAsymmetryKeyFromJsonWebKeyOrSPKI, CryptoException.InvalidCryptoKey)

export async function parse38(payload: string): PayloadParserResult {
    //#region Parse text
    const header = '🎼4/4'
    if (!payload.startsWith(header)) return new Err(PayloadException.InvalidPayload, 'Unknown version').toErr()
    let rest = payload.slice(header.length)
    // cut the tail
    rest = rest.slice(0, rest.lastIndexOf(':||'))

    const { AESKeyEncrypted, encryptedText, iv, signature, authorPublicKey, authorUserID, isPublic } = splitFields(rest)
    //#endregion

    //#region Normalization
    const raw_iv = decodeUint8ArrayCrypto(iv).andThen(assertIVLengthEq16)
    const raw_aes = decodeUint8ArrayCrypto(AESKeyEncrypted)
    const encryption: PayloadParseResult.EndToEndEncryption | PayloadParseResult.PublicEncryption = isPublic
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
        encrypted: decodeUint8Array(encryptedText),
    }
    if (authorUserID.err) {
        normalized.author = authorUserID.mapErr(Err.mapErr(PayloadException.DecodeFailed))
    } else if (authorUserID.val.some) {
        normalized.author = Identifier.fromString(`person:${authorUserID.val.val}`, ProfileIdentifier)
            .map((x) => Some(x))
            .mapErr(Err.mapErr(PayloadException.DecodeFailed))
    }
    if (authorPublicKey) {
        normalized.authorPublicKey = await decodeECDHPublicKey(authorPublicKey)
    }
    if (signature && raw_iv.ok && raw_aes.ok && normalized.encrypted.ok) {
        const message = encodeText(`4/4|${AESKeyEncrypted}|${iv}|${encryptedText}`)
        const sig = decodeUint8Array(signature)
        if (sig.ok) {
            normalized.signature = OptionalResult.Some<Signature>({ signee: message, signature: sig.val })
        } else {
            normalized.signature = sig
        }
    }
    return Ok(normalized)
    //#endregion
}

// ? Version 38:🎼4/4|AESKeyEncrypted|iv|encryptedText|signature|authorPublicKey?|publicShared?|authorIdentifier?:||
function splitFields(raw: string) {
    const [, AESKeyEncrypted = '', iv = '', encryptedText = '', signature, authorPublicKey, isPublic, authorUserIDRaw] =
        raw.split('|')
    const authorUserID: OptionalResult<string, any> = authorUserIDRaw
        ? Result.wrap(() => Some(atob(authorUserIDRaw)))
        : OptionalResult.None
    return {
        AESKeyEncrypted,
        encryptedText,
        iv,
        // "_" is used as placeholder
        signature: (signature === '_' ? undefined : signature) as string | undefined,
        authorPublicKey: authorPublicKey as string | undefined,
        authorUserID,
        isPublic: isPublic === '1' ? true : false,
    }
}

async function decodePublicSharedAESKey(
    iv: Result<Uint8Array, Err<CryptoException>>,
    encryptedKey: Result<Uint8Array, Err<CryptoException>>,
): Promise<PayloadParseResult.PublicEncryption['AESKey']> {
    if (iv.err) return iv
    if (encryptedKey.err) return encryptedKey
    const publicSharedKey = await get_v38PublicSharedCryptoKey()
    if (publicSharedKey.err) return publicSharedKey

    const import_AES_GCM_256 = Err.withErr(importAESFromJWK.AES_GCM_256, CryptoException.InvalidCryptoKey)
    const decrypt = Err.withErr(decryptWithAES, CryptoException.InvalidCryptoKey)

    const jwk_in_u8arr = await decrypt(AESAlgorithmEnum.A256GCM, publicSharedKey.val, iv.val, encryptedKey.val)
    const jwk_in_text = await andThenAsync(jwk_in_u8arr, decodeTextCrypto)
    const jwk = await andThenAsync(jwk_in_text, JSONParse)
    const aes = await andThenAsync(jwk, import_AES_GCM_256)

    return aes.map<AESKey>((key) => ({ algr: AESAlgorithmEnum.A256GCM, key }))
}

async function decodeECDHPublicKey(
    compressedPublic: string,
): Promise<OptionalResult<AsymmetryCryptoKey, CryptoException>> {
    const key = decodeUint8ArrayCrypto(compressedPublic).andThen(decompressK256Point)

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
    return OptionalResult.Some<AsymmetryCryptoKey>({
        algr: PublicKeyAlgorithmEnum.secp256k1,
        key: imported.val,
    })
}

function decompressK256Point(point: Uint8Array) {
    if (!isPoint(point)) return new Err(CryptoException.InvalidCryptoKey, null).toErr()
    const uncompressed: Uint8Array = isPointCompressed(point) ? pointCompress(point, false) : point
    const len = (uncompressed.length - 1) / 2
    const x = uncompressed.slice(1, len + 1)
    const y = uncompressed.slice(len + 1)
    return Ok([Convert.ToBase64Url(x), Convert.ToBase64Url(y)] as readonly [x: string, y: string])
}
