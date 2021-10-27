import type { PayloadParserResult } from '.'
import type { PayloadParseResult } from '../payload'
import { EKindsError as Err, EKinds, OptionalResult } from '../types'
import { Ok, Result } from 'ts-results'
import { AESKey, AESAlgorithmEnum, AsymmetryCryptoKey, PublicKeyAlgorithmEnum, Signature } from '../payload/types'
import {
    andThenAsync,
    decodeMessagePackF,
    assertIVLengthEq16,
    importAESFromJWK,
    importAsymmetryKeyFromJsonWebKeyOrSPKI,
} from '../utils'
import { ProfileIdentifier } from '@masknet/shared-base'
import { safeUnreachable } from '@dimensiondev/kit'
// ? Payload format: (binary format)
// ? See: docs/rfc/000-Payload-37.md

const decode = decodeMessagePackF(EKinds.InvalidPayload, EKinds.DecodeFailed)
const err = (msg: string, kind = EKinds.InvalidPayload) => new Err(kind, msg).toErr()
const importSpki = Err.withErr(importAsymmetryKeyFromJsonWebKeyOrSPKI, EKinds.InvalidCryptoKey)
const importAES256 = Err.withErr(importAESFromJWK, EKinds.InvalidCryptoKey)
export async function parse37(input: ArrayBuffer): PayloadParserResult {
    const signatureContainer = parseSignatureContainer(input)
    if (signatureContainer.err) return signatureContainer
    const { payload, signature } = signatureContainer.val
    return parsePayload37(payload, signature)
}

function parseSignatureContainer(payload: ArrayBuffer) {
    return decode(payload)
        .andThen(assertArray('SignatureContainer'))
        .andThen((item) => {
            const [version, payload, rawSignature] = item
            if (version !== 0) return err('Invalid version')
            return assertArrayBuffer(payload, 'SignatureContainer[1]').andThen((payload) => {
                const signature =
                    rawSignature === null
                        ? OptionalResult.None
                        : assertArrayBuffer(rawSignature, 'SignatureContainer[2]').andThen((sig) =>
                              OptionalResult.Some<Signature>({ signature: sig, signee: payload }),
                          )
                return Ok({ payload, signature })
            })
        })
}

function parsePayload37(payload: ArrayBuffer, signature: PayloadParseResult.Payload['signature']) {
    const _ = decode(payload).andThen(assertArray('Payload'))
    return andThenAsync(_, async (item) => {
        const [version, authorNetwork, authorID, authorPublicKeyAlg, authorPublicKey, encryption, data] = item
        if (version !== -37) return err('Unknown version')

        const normalized: PayloadParseResult.Payload = {
            version: -37,
            author: parseAuthor(authorNetwork, authorID),
            authorPublicKey: OptionalResult.fromResult(
                await importAsymmetryKey(authorPublicKeyAlg, authorPublicKey, 'authorPublicKey'),
            ),
            encryption: await parseEncryption(encryption),
            encrypted: assertArrayBuffer(data, 'encrypted'),
            signature,
        }
        return Ok(normalized)
    })
}

function parseAuthor(network: unknown, id: unknown): PayloadParseResult.Payload['author'] {
    if (network === null) return OptionalResult.None
    if (id === '' || id === null) return OptionalResult.None
    if (typeof id !== 'string') return err('Invalid user id')

    let net = ''
    if (network === SocialNetworkEnum.Facebook) net = 'facebook.com'
    else if (network === SocialNetworkEnum.Twitter) net = 'twitter.com'
    else if (network === SocialNetworkEnum.Instagram) net = 'instagram.com'
    else if (network === SocialNetworkEnum.Minds) net = 'minds.com'
    else if (typeof network === 'string') net = network
    else if (typeof network !== 'number') return err('Invalid network')
    else return err('Invalid network', EKinds.UnknownEnumMember)

    if (net.includes('/')) return err('Invalid network')

    return OptionalResult.Some(new ProfileIdentifier(net, id))
}

async function parseEncryption(encryption: unknown): Promise<PayloadParseResult.Payload['encryption']> {
    if (!Array.isArray(encryption)) return err('Invalid encryption')
    const kind: EncryptionKind = encryption[0]
    if (kind === EncryptionKind.PeerToPeer) {
        const [, ownersAESKeyEncrypted, iv, authorEphemeralPublicKeys] = encryption
        const e: PayloadParseResult.EndToEndEncryption = {
            type: 'E2E',
            iv: assertArrayBuffer(iv, 'iv').andThen(assertIVLengthEq16),
            ownersAESKeyEncrypted: assertArrayBuffer(ownersAESKeyEncrypted, 'ownersAESKeyEncrypted'),
            ephemeralPublicKey: await parseAuthorEphemeralPublicKeys(authorEphemeralPublicKeys),
        }
        return Ok(e)
    } else if (kind === EncryptionKind.Public) {
        const [, AESKey, iv] = encryption
        const e: PayloadParseResult.PublicEncryption = {
            type: 'public',
            iv: assertArrayBuffer(iv, 'iv').andThen(assertIVLengthEq16),
            AESKey: await parseAES(AESKey),
        }
        return Ok(e)
    } else {
        safeUnreachable(kind)
    }

    return err('Invalid encryption')

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

    return andThenAsync(assertArray('aes')(aes), async (aes): T => {
        const [alg, k] = aes
        if (typeof k === 'string') {
            if (alg === 'A256GCM') {
                const jwk: JsonWebKey = { ext: true, key_ops: ['encrypt', 'decrypt'], kty: 'oct', alg, k }
                const key = await importAES256(jwk, AESAlgorithmEnum.AES_GCM_256)
                if (key.err) return key
                return Ok<AESKey>({ algr: AESAlgorithmEnum.AES_GCM_256, key: key.val })
            }
            if (typeof alg !== 'string') return err('Invalid AES key algorithm')
            return err('Invalid AES key algorithm', EKinds.UnsupportedAlgorithm)
        }
        return err('Invalid AES key')
    })
}
function importAsymmetryKey(algr: unknown, key: unknown, name: string) {
    type T = Promise<Result<AsymmetryCryptoKey, Err<PayloadParseResult.CryptoKeyException>>>
    return andThenAsync(assertArrayBuffer(key, name), async (pubKey): T => {
        if (typeof algr !== 'string' && typeof algr !== 'number') return err('Invalid PublicKeyAlgorithm')

        if (typeof algr === 'number') {
            if (algr in PublicKeyAlgorithmEnum) {
                const key = await importSpki(pubKey, algr)
                if (key.err) return key
                return Ok<AsymmetryCryptoKey>({ algr, key: key.val })
            }
        }
        return err('Invalid AES key algorithm', EKinds.UnsupportedAlgorithm)
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

function assertArrayBuffer(x: unknown, name: string) {
    if (x instanceof ArrayBuffer) return Ok(x)
    return err(`${name} is not a Binary`)
}
function assertArray(name: string) {
    return (x: unknown) => {
        if (Array.isArray(x)) return Ok(x)
        return err(`${name} is no an Array`)
    }
}
