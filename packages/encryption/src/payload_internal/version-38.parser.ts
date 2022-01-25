/* eslint @dimensiondev/unicode-specific-set: ["error", { "only": "code" }] */
import {
    AESKey,
    AESAlgorithmEnum,
    AsymmetryCryptoKey,
    PayloadParseResult,
    PublicKeyAlgorithmEnum,
    Signature,
} from '../payload'
import { CryptoException, PayloadException } from '../types'
import { Result, Ok, Some } from 'ts-results'
import {
    decodeUint8ArrayF,
    decodeTextF,
    decryptWithAES,
    assertIVLengthEq16,
    importAESFromJWK,
    importAsymmetryKeyFromJsonWebKeyOrSPKI,
    JSONParseF,
} from '../utils'
import type { PayloadParserResult } from '.'
import { get_v38PublicSharedCryptoKey } from './shared'
import { encodeText } from '@dimensiondev/kit'
import {
    andThenAsync,
    CheckedError,
    Identifier,
    OptionalResult,
    ProfileIdentifier,
    decompressSecp256k1Point,
} from '@masknet/shared-base'

const decodeUint8Array = decodeUint8ArrayF(PayloadException.InvalidPayload, PayloadException.DecodeFailed)
const decodeUint8ArrayCrypto = decodeUint8ArrayF(CryptoException.InvalidCryptoKey, CryptoException.InvalidCryptoKey)
const decodeTextCrypto = decodeTextF(CryptoException.InvalidCryptoKey, CryptoException.InvalidCryptoKey)
const JSONParse = JSONParseF(CryptoException.InvalidCryptoKey, CryptoException.InvalidCryptoKey)
const importEC = CheckedError.withErr(importAsymmetryKeyFromJsonWebKeyOrSPKI, CryptoException.InvalidCryptoKey)

export async function parse38(payload: string): PayloadParserResult {
    // #region Parse text
    const header = '\u{1F3BC}4/4'
    if (!payload.startsWith(header)) return new CheckedError(PayloadException.InvalidPayload, 'Unknown version').toErr()
    let rest = payload.slice(header.length)
    // cut the tail
    rest = rest.slice(0, rest.lastIndexOf(':||'))

    const { AESKeyEncrypted, encryptedText, iv, signature, authorPublicKey, authorUserID, isPublic } = splitFields(rest)
    // #endregion

    // #region Normalization
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
        normalized.author = authorUserID.mapErr(CheckedError.mapErr(PayloadException.DecodeFailed))
    } else if (authorUserID.val.some) {
        normalized.author = Identifier.fromString(`person:${authorUserID.val.val}`, ProfileIdentifier)
            .map((x) => Some(x))
            .mapErr(CheckedError.mapErr(PayloadException.DecodeFailed))
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
    // #endregion
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
        isPublic: isPublic === '1',
    }
}

async function decodePublicSharedAESKey(
    iv: Result<Uint8Array, CheckedError<CryptoException>>,
    encryptedKey: Result<Uint8Array, CheckedError<CryptoException>>,
): Promise<PayloadParseResult.PublicEncryption['AESKey']> {
    if (iv.err) return iv
    if (encryptedKey.err) return encryptedKey
    const publicSharedKey = await get_v38PublicSharedCryptoKey()
    if (publicSharedKey.err) return publicSharedKey

    const import_AES_GCM_256 = CheckedError.withErr(importAESFromJWK.AES_GCM_256, CryptoException.InvalidCryptoKey)
    const decrypt = CheckedError.withErr(decryptWithAES, CryptoException.InvalidCryptoKey)

    const jwk_in_u8arr = await decrypt(AESAlgorithmEnum.A256GCM, publicSharedKey.val, iv.val, encryptedKey.val)
    const jwk_in_text = await andThenAsync(jwk_in_u8arr, decodeTextCrypto)
    const jwk = await andThenAsync(jwk_in_text, JSONParse)
    const aes = await andThenAsync(jwk, import_AES_GCM_256)

    return aes.map<AESKey>((key) => ({ algr: AESAlgorithmEnum.A256GCM, key }))
}

async function decodeECDHPublicKey(
    compressedPublic: string,
): Promise<OptionalResult<AsymmetryCryptoKey, CryptoException>> {
    const key = decodeUint8ArrayCrypto(compressedPublic).andThen((val) =>
        Result.wrap(() => decompressSecp256k1Point(val)).mapErr(
            (e) => new CheckedError(CryptoException.InvalidCryptoKey, e),
        ),
    )

    if (key.err) return key
    const { x, y } = key.val
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
