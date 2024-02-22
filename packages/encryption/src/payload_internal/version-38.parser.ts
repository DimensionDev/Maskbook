/* eslint @masknet/unicode-specific-set: ["error", { "only": "code" }] */
import { type EC_Key, type PayloadParseResult, EC_KeyCurve, type Signature } from '../payload/index.js'
import { CryptoException, PayloadException, type Readwrite } from '../types/index.js'
import { Result, Ok, Some } from 'ts-results-es'
import {
    decodeUint8ArrayF,
    decodeTextF,
    decryptWithAES,
    assertIVLengthEq16,
    importAES,
    importEC_Key,
    JSONParseF,
} from '../utils/index.js'
import type { PayloadParserResult } from './index.js'
import { get_v38PublicSharedCryptoKey } from './shared.js'
import { encodeText } from '@masknet/kit'
import { andThenAsync, CheckedError, OptionalResult, ProfileIdentifier, decompressK256Point } from '@masknet/base'

const decodeUint8Array = decodeUint8ArrayF(PayloadException.InvalidPayload, PayloadException.DecodeFailed)
const decodeUint8ArrayCrypto = decodeUint8ArrayF(CryptoException.InvalidCryptoKey, CryptoException.InvalidCryptoKey)
const decodeTextCrypto = decodeTextF(CryptoException.InvalidCryptoKey, CryptoException.InvalidCryptoKey)
const JSONParse = JSONParseF(CryptoException.InvalidCryptoKey, CryptoException.InvalidCryptoKey)
const importEC = CheckedError.withErr(importEC_Key, CryptoException.InvalidCryptoKey)

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
    const encryption: PayloadParseResult.EndToEndEncryption | PayloadParseResult.PublicEncryption =
        isPublic ?
            {
                type: 'public',
                iv: raw_iv,
                AESKey: await decodePublicSharedAESKey(raw_iv, raw_aes),
            }
        :   {
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
    if (authorUserID.isErr()) {
        normalized.author = authorUserID.mapErr(CheckedError.mapErr(PayloadException.DecodeFailed))
    } else if (authorUserID.value.isSome()) {
        normalized.author = ProfileIdentifier.from(`person:${authorUserID.value.value}`)
            .map((x) => Some(x))
            .toResult(undefined)
            .mapErr(CheckedError.mapErr(PayloadException.DecodeFailed))
    }
    if (authorPublicKey) {
        normalized.authorPublicKey = await decodeECDHPublicKey(authorPublicKey)
    }
    if (signature && raw_iv.isOk() && raw_aes.isOk() && normalized.encrypted.isOk()) {
        const message = encodeText(`4/4|${AESKeyEncrypted}|${iv}|${encryptedText}`)
        const sig = decodeUint8Array(signature)
        if (sig.isOk()) {
            normalized.signature = OptionalResult.Some<Signature>({ signee: message, signature: sig.value })
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
    const authorUserID: OptionalResult<string, any> =
        authorUserIDRaw ? Result.wrap(() => Some(atob(authorUserIDRaw))) : OptionalResult.None
    return {
        AESKeyEncrypted,
        encryptedText,
        iv,
        // "_" is used as placeholder
        signature: signature === '_' ? undefined : signature,
        authorPublicKey: authorPublicKey as string | undefined,
        authorUserID,
        isPublic: isPublic === '1',
    }
}

async function decodePublicSharedAESKey(
    iv: Result<Uint8Array, CheckedError<CryptoException>>,
    encryptedKey: Result<Uint8Array, CheckedError<CryptoException>>,
): Promise<PayloadParseResult.PublicEncryption['AESKey']> {
    if (iv.isErr()) return iv
    if (encryptedKey.isErr()) return encryptedKey
    const publicSharedKey = await get_v38PublicSharedCryptoKey()
    if (publicSharedKey.isErr()) return publicSharedKey

    const import_AES_GCM_256 = CheckedError.withErr(importAES, CryptoException.InvalidCryptoKey)
    const decrypt = CheckedError.withErr(decryptWithAES, CryptoException.InvalidCryptoKey)

    const jwk_in_u8arr = await decrypt(publicSharedKey.value, iv.value, encryptedKey.value)
    const jwk_in_text = await andThenAsync(jwk_in_u8arr, decodeTextCrypto)
    const jwk = await andThenAsync(jwk_in_text, JSONParse)
    const aes = await andThenAsync(jwk, import_AES_GCM_256)

    return aes
}

async function decodeECDHPublicKey(compressedPublic: string): Promise<OptionalResult<EC_Key, CryptoException>> {
    const key = await andThenAsync(decodeUint8ArrayCrypto(compressedPublic), async (val) =>
        (await Result.wrapAsync(() => decompressK256Point(val))).mapErr(
            (e) => new CheckedError(CryptoException.InvalidCryptoKey, e),
        ),
    )

    if (key.isErr()) return key
    const { x, y } = key.value
    const jwk: JsonWebKey = {
        crv: 'K-256',
        ext: true,
        x,
        y,
        key_ops: ['deriveKey', 'deriveBits'],
        kty: 'EC',
    }
    const imported = await importEC(jwk, EC_KeyCurve.secp256k1)
    if (imported.isErr()) return imported
    return OptionalResult.Some<EC_Key>({
        algr: EC_KeyCurve.secp256k1,
        key: imported.value,
    })
}
