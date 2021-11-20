import type { PayloadParserResult } from '.'
import type { PayloadParseResult } from '../payload'
import {
    EKindsError as Err,
    CryptoException,
    PayloadException,
    OptionalResult,
    assertArray,
    assertUint8Array,
} from '../types'
import { Ok, Result } from 'ts-results'
import { AESKey, AESAlgorithmEnum, AsymmetryCryptoKey, PublicKeyAlgorithmEnum } from '../payload/types'
import {
    andThenAsync,
    decodeMessagePackF,
    assertIVLengthEq16,
    importAESFromJWK,
    importAsymmetryKeyFromJsonWebKeyOrSPKI,
} from '../utils'
import { ProfileIdentifier } from '@masknet/shared-base'
import { safeUnreachable } from '@dimensiondev/kit'
import { parseSignatureContainer } from './SignatureContainer'
// ? Payload format: (binary format)
// ? See: docs/rfc/000-Payload-37.md

const decode = decodeMessagePackF(PayloadException.InvalidPayload, PayloadException.DecodeFailed)
const InvalidPayload = (msg?: string) => new Err(PayloadException.InvalidPayload, msg).toErr()
const importSpki = Err.withErr(importAsymmetryKeyFromJsonWebKeyOrSPKI, CryptoException.InvalidCryptoKey)
const importAES256 = Err.withErr(importAESFromJWK, CryptoException.InvalidCryptoKey)
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
        if (version !== -37) return new Err(PayloadException.UnknownVersion, null).toErr()

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

function parseAuthor(network: unknown, id: unknown): PayloadParseResult.Payload['author'] {
    if (network === null) return OptionalResult.None
    if (id === '' || id === null) return OptionalResult.None
    if (typeof id !== 'string') return InvalidPayload('Invalid user id')

    let net = ''
    if (network === SocialNetworkEnum.Facebook) net = 'facebook.com'
    else if (network === SocialNetworkEnum.Twitter) net = 'twitter.com'
    else if (network === SocialNetworkEnum.Instagram) net = 'instagram.com'
    else if (network === SocialNetworkEnum.Minds) net = 'minds.com'
    else if (typeof network === 'string') net = network
    else if (typeof network !== 'number') return InvalidPayload('Invalid network')
    else return new Err(PayloadException.UnknownEnumMember, 'unknown network').toErr()

    if (net.includes('/')) return InvalidPayload('Invalid network')

    return OptionalResult.Some(new ProfileIdentifier(net, id))
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
    async function parseAuthorEphemeralPublicKey([key, value]: [string, unknown]) {
        const result = await importAsymmetryKey(key, value, 'authorEphemeralPublicKey')
        return [key, result] as const
    }
}
function parseAES(aes: unknown) {
    type T = Promise<PayloadParseResult.PublicEncryption['AESKey']>

    return andThenAsync(assertArray('aes', CryptoException.InvalidCryptoKey)(aes), async (aes): T => {
        const [algr, k] = aes
        if (typeof k === 'string') {
            if (algr === AESAlgorithmEnum.A256GCM) {
                const jwk: JsonWebKey = { ext: true, key_ops: ['encrypt', 'decrypt'], kty: 'oct', alg: algr, k }
                const key = await importAES256(jwk, algr)
                if (key.err) return key
                return Ok<AESKey>({ algr, key: key.val })
            }
        }
        return new Err(CryptoException.UnsupportedAlgorithm, null).toErr()
    })
}
function importAsymmetryKey(algr: unknown, key: unknown, name: string) {
    type T = Promise<Result<AsymmetryCryptoKey, Err<CryptoException>>>
    return andThenAsync(assertUint8Array(key, name, CryptoException.InvalidCryptoKey), async (pubKey): T => {
        if (typeof algr === 'number') {
            if (algr in PublicKeyAlgorithmEnum) {
                const key = await importSpki(pubKey, algr)
                if (key.err) return key
                return Ok<AsymmetryCryptoKey>({ algr, key: key.val })
            }
        }
        return new Err(CryptoException.UnsupportedAlgorithm, null).toErr()
    })
}
enum SocialNetworkEnum {
    Facebook = 0,
    Twitter = 1,
    Instagram = 2,
    Minds = 3,
}
enum EncryptionKind {
    Public = 0,
    PeerToPeer = 1,
}
