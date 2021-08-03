import type { PayloadParserResult } from '.'
import type { PayloadParseResult } from '../payload'
import { Exception, ExceptionKinds, OptionalResult } from '../types'
import { Ok, Result, Some } from 'ts-results'
import { AESKey, AESKeyParameterEnum, AsymmetryCryptoKey, PublicKeyAlgorithmEnum, Signature } from '../payload/types'
import {
    andThenAsync,
    decodeMessagePackF,
    ensureIVLength16,
    importAESFromJWK,
    importAsymmetryKeyFromJsonWebKeyOrSPKI,
} from '../utils'
import { Identifier, ProfileIdentifier } from '@masknet/shared-base'
import { safeUnreachable } from '@dimensiondev/kit'
// ? Payload format: (binary format)
// ? See: docs/rfc/000-Payload-37.md

const decode = decodeMessagePackF(ExceptionKinds.InvalidPayload, ExceptionKinds.DecodeFailed)
const invalid = (msg: string) => new Exception(ExceptionKinds.InvalidPayload, msg).toErr()
const importSpki = Exception.withErr(importAsymmetryKeyFromJsonWebKeyOrSPKI, ExceptionKinds.InvalidCryptoKey)
const importAES256 = Exception.withErr(importAESFromJWK, ExceptionKinds.InvalidCryptoKey)
export async function parse37(input: ArrayBuffer): PayloadParserResult {
    const signatureContainer = parseSignatureContainer(input)
    if (signatureContainer.err) return signatureContainer
    const { payload, signature } = signatureContainer.val
    return parsePayload37(payload, signature)
}

function parseSignatureContainer(payload: ArrayBuffer) {
    return decode(payload)
        .andThen(ensureArray('SignatureContainer'))
        .andThen((item) => {
            const [version, payload, rawSignature] = item
            if (version !== 0) return invalid('Invalid version')
            return ensureArrayBuffer(payload, 'SignatureContainer[1]').andThen((payload) => {
                const signature = ensureArrayBuffer(rawSignature, 'SignatureContainer[2]').andThen((sig) =>
                    OptionalResult.Some<Signature>([payload, sig]),
                )
                return Ok({ payload, signature })
            })
        })
}

function parsePayload37(payload: ArrayBuffer, signature: PayloadParseResult.Payload['signature']) {
    const _ = decode(payload).andThen(ensureArray('Payload'))
    return andThenAsync(_, async (item) => {
        const [version, authorNetwork, authorID, authorPublicKeyAlg, authorPublicKey, encryption, data] = item
        if (version !== -37) return invalid('Unknown version')

        const normalized: PayloadParseResult.Payload = {
            version: -37,
            author: parseAuthor(authorNetwork, authorID),
            authorPublicKey: OptionalResult.fromResult(
                await importAsymmetryKey(authorPublicKeyAlg, authorPublicKey, 'authorPublicKey'),
            ),
            encryption: await parseEncryption(encryption),
            encrypted: ensureArrayBuffer(data, 'encrypted'),
            signature,
        }
        return Ok(normalized)
    })
}

function parseAuthor(network: unknown, id: string): PayloadParseResult.Payload['author'] {
    let net = ''
    if (network === SocialNetworkEnum.Facebook) net = 'facebook.com'
    else if (network === SocialNetworkEnum.Twitter) net = 'twitter.com'
    else if (network === SocialNetworkEnum.Instgram) net = 'instagram.com'
    else if (network === SocialNetworkEnum.Minds) net = 'minds.com'
    else if (typeof network === 'string') net = network
    else return invalid('Unrecognized network')

    if (typeof id !== 'string') return invalid('Invalid user id')
    if (net.includes('/')) return invalid('Invalid network')

    if (id === '') return OptionalResult.None

    return Identifier.fromString(`person:${net}/${id}`, ProfileIdentifier)
        .map((x) => Some(x))
        .mapErr(Exception.mapErr(ExceptionKinds.DecodeFailed))
}

async function parseEncryption(encryption: unknown): Promise<PayloadParseResult.Payload['encryption']> {
    if (!Array.isArray(encryption)) return invalid('Invalid encryption')
    const kind: EncryptionKind = encryption[0]
    if (kind === EncryptionKind.PeerToPeer) {
        const [, ownersAESKeyEncrypted, iv, authorEphemeralPublicKeys] = encryption
        const e: PayloadParseResult.EndToEndEncryption = {
            type: 'E2E',
            iv: ensureArrayBuffer(iv, 'iv').andThen(ensureIVLength16),
            ownersAESKeyEncrypted: ensureArrayBuffer(ownersAESKeyEncrypted, 'ownersAESKeyEncrypted'),
            ephemeralPublicKey: await parseAuthorEphemeralPublicKeys(authorEphemeralPublicKeys),
        }
        return Ok(e)
    } else if (kind === EncryptionKind.Public) {
        const [, AESKey, iv] = encryption
        const e: PayloadParseResult.PublicEncryption = {
            type: 'public',
            iv: ensureArrayBuffer(iv, 'iv').andThen(ensureIVLength16),
            AESKey: await parseAES(AESKey),
        }
        return Ok(e)
    } else {
        safeUnreachable(kind)
    }

    return invalid('Invalid encryption')

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

    return andThenAsync(ensureArray('aes')(aes), async (aes): T => {
        const [alg, k] = aes
        if (typeof k === 'string') {
            if (alg === 'A256GCM') {
                const jwk: JsonWebKey = { ext: true, key_ops: ['encrypt', 'decrypt'], kty: 'oct', alg, k }
                const key = await importAES256(jwk, AESKeyParameterEnum.AES_GCM_256)
                if (key.err) return key
                return Ok<AESKey>([AESKeyParameterEnum.AES_GCM_256, key.val])
            }
            if (typeof alg !== 'string') return invalid('Invalid AES key algorithm')
            return new Exception(ExceptionKinds.UnsupportedAlgorithm, 'Unknown AES Key algorithm').toErr()
        }
        return invalid('Invalid AES key')
    })
}
function importAsymmetryKey(alg: unknown, key: unknown, name: string) {
    type T = Promise<Result<AsymmetryCryptoKey, Exception<PayloadParseResult.CryptoKeyException>>>
    return andThenAsync(ensureArrayBuffer(key, name), async (pubKey): T => {
        if (typeof alg !== 'string' && typeof alg !== 'number') return invalid('Invalid PublicKeyAlgorithm')

        if (typeof alg === 'number') {
            if (alg in PublicKeyAlgorithmEnum) {
                const key = await importSpki(pubKey, alg)
                if (key.err) return key
                return Ok<AsymmetryCryptoKey>([alg, key.val])
            }
        }
        return new Exception(ExceptionKinds.UnsupportedAlgorithm, 'Unknown algorithm').toErr()
    })
}
enum SocialNetworkEnum {
    Facebook = 0,
    Twitter = 1,
    Instgram = 2,
    Minds = 3,
}
enum EncryptionKind {
    Public = 0,
    PeerToPeer = 1,
}

function ensureArrayBuffer(x: unknown, name: string) {
    if (x instanceof ArrayBuffer) return Ok(x)
    return invalid(`${name} is not a Binary`)
}
function ensureArray(name: string) {
    return (x: unknown) => {
        if (Array.isArray(x)) return Ok(x)
        return invalid(`${name} is no an Array`)
    }
}
