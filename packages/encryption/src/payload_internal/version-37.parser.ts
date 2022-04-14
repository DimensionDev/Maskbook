import type { PayloadParserResult } from '.'
import type { PayloadParseResult } from '../payload'
import { CryptoException, PayloadException, assertArray, assertUint8Array } from '../types'
import { andThenAsync, CheckedError, decompressSecp256k1KeyRaw, OptionalResult } from '@masknet/shared-base'
import { Ok, Result } from 'ts-results'
import { EC_Key, EC_KeyCurveEnum } from '../payload/types'
import { decodeMessagePackF, assertIVLengthEq16, importAES, importEC_Key } from '../utils'
import { safeUnreachable } from '@dimensiondev/kit'
import { parseSignatureContainer } from './SignatureContainer'
import { parseAuthor } from './shared'
// ? Payload format: (binary format)
// ? See: docs/rfc/000-Payload-37.md

const decode = decodeMessagePackF(PayloadException.InvalidPayload, PayloadException.DecodeFailed)
const InvalidPayload = (msg?: string) => new CheckedError(PayloadException.InvalidPayload, msg).toErr()
const importAES256 = CheckedError.withErr(importAES, CryptoException.InvalidCryptoKey)
const importEC = CheckedError.withErr(importEC_Key, CryptoException.InvalidCryptoKey)
export async function parse37(input: Uint8Array): PayloadParserResult {
    const signatureContainer = parseSignatureContainer(input)
    if (signatureContainer.err) return signatureContainer
    const { payload, signature } = signatureContainer.val
    return parsePayload37(payload, signature)
}

function parsePayload37(payload: Uint8Array, signature: PayloadParseResult.Payload['signature']) {
    const _ = decode(payload).andThen(assertArray('Payload', PayloadException.InvalidPayload))
    return andThenAsync(_, async (item) => {
        const [version, authorNetwork, authorID, authorPublicKeyAlg, authorPublicKey, encryption, data] = item
        // 0 in payload means -37, 1 means -36, ...etc
        if (version !== 0) return new CheckedError(PayloadException.UnknownVersion, null).toErr()

        const normalized: PayloadParseResult.Payload = {
            version: -37,
            author: parseAuthor(authorNetwork, authorID),
            authorPublicKey: authorPublicKey
                ? OptionalResult.fromResult(
                      await importAsymmetryKey(authorPublicKeyAlg, authorPublicKey, 'authorPublicKey'),
                  )
                : OptionalResult.None,
            encryption: await parseEncryption(encryption),
            encrypted: assertUint8Array(data, 'encrypted', PayloadException.InvalidPayload),
            signature,
        }
        return Ok(normalized)
    })
}

async function parseEncryption(encryption: unknown): Promise<PayloadParseResult.Payload['encryption']> {
    if (!Array.isArray(encryption)) return InvalidPayload('Invalid encryption')
    const kind: EncryptionKind = encryption[0]
    if (kind === EncryptionKind.PeerToPeer) {
        const [, ownersAESKeyEncrypted, iv, authorEphemeralPublicKeys] = encryption
        const e: PayloadParseResult.EndToEndEncryption = {
            type: 'E2E',
            iv: assertUint8Array(iv, 'iv', PayloadException.InvalidPayload).andThen(assertIVLengthEq16),
            ownersAESKeyEncrypted: assertUint8Array(
                ownersAESKeyEncrypted,
                'ownersAESKeyEncrypted',
                PayloadException.InvalidPayload,
            ),
            ephemeralPublicKey: await parseAuthorEphemeralPublicKeys(authorEphemeralPublicKeys),
        }
        return Ok(e)
    } else if (kind === EncryptionKind.Public) {
        const [, AESKey, iv] = encryption
        const e: PayloadParseResult.PublicEncryption = {
            type: 'public',
            iv: assertUint8Array(iv, 'iv', PayloadException.InvalidPayload).andThen(assertIVLengthEq16),
            AESKey: await parseAES(AESKey),
        }
        return Ok(e)
    } else {
        safeUnreachable(kind)
    }

    return InvalidPayload('Invalid encryption')

    async function parseAuthorEphemeralPublicKeys(item: unknown) {
        if (typeof item !== 'object' || item === null) return {}
        return Object.fromEntries(await Promise.all(Object.entries(item).map(parseAuthorEphemeralPublicKey)))
    }
    async function parseAuthorEphemeralPublicKey([key, value]: [string | number, unknown]) {
        const isEnumLike = Number.parseInt(key.toString(), 10)
        if (!Number.isNaN(isEnumLike)) key = isEnumLike
        const result = await importAsymmetryKey(key, value, 'authorEphemeralPublicKey')
        return [key, result] as const
    }
}
async function parseAES(aes: unknown) {
    return andThenAsync(assertUint8Array(aes, 'aes', CryptoException.InvalidCryptoKey), importAES256)
}
function importAsymmetryKey(algr: unknown, key: unknown, name: string) {
    type T = Promise<Result<EC_Key, CheckedError<CryptoException>>>
    return andThenAsync(assertUint8Array(key, name, CryptoException.InvalidCryptoKey), async (pubKey): T => {
        if (typeof algr === 'number') {
            if (algr in EC_KeyCurveEnum) {
                if (algr === EC_KeyCurveEnum.secp256k1) {
                    pubKey = decompressSecp256k1KeyRaw(pubKey)
                }
                const key = await importEC(pubKey, algr)
                if (key.err) return key
                return Ok<EC_Key>({ algr, key: key.val })
            }
        }
        return new CheckedError(CryptoException.UnsupportedAlgorithm, null).toErr()
    })
}
enum EncryptionKind {
    Public = 0,
    PeerToPeer = 1,
}
