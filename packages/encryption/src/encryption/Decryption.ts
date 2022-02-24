import { unreachable } from '@dimensiondev/kit'
import { decodeTypedMessageFromDocument, decodeTypedMessageV38ToV40Format } from '@masknet/typed-message'
import { AESCryptoKey, EC_Public_CryptoKey, andThenAsync } from '@masknet/shared-base'
import { None, Result } from 'ts-results'
import { AESAlgorithmEnum, PayloadParseResult } from '../payload'
import { decryptWithAES, importAESFromJWK } from '../utils'
import {
    DecryptOptions,
    DecryptIO,
    DecryptProgress,
    DecryptProgressKind,
    DecryptError,
    DecryptEphemeralECDH_PostKey,
    DecryptSuccess,
} from './DecryptionTypes'
export * from './DecryptionTypes'
const ErrorReasons = DecryptError.Reasons
type Version = PayloadParseResult.Payload['version']
export async function* decrypt(options: DecryptOptions, io: DecryptIO): AsyncIterableIterator<DecryptProgress> {
    yield progress(DecryptProgressKind.Started)

    const { author: _author, encrypted: _encrypted, encryption: _encryption, version } = options.message
    const { authorPublicKey: _authorPublicKey } = options.message

    if (_encryption.err) return yield new DecryptError(ErrorReasons.PayloadBroken, _encryption.val)
    if (_encrypted.err) return yield new DecryptError(ErrorReasons.PayloadBroken, _encrypted.val)
    const encryption = _encryption.val
    const encrypted = _encrypted.val

    // ! try decrypt by cache
    {
        const cacheKey = await io.getPostKeyCache().catch(() => null)
        const iv = encryption.iv.unwrapOr(null)
        if (cacheKey && iv) return yield* decryptWithPostAESKey(version, cacheKey, iv, encrypted)
    }

    if (encryption.type === 'public') {
        const { AESKey, iv } = encryption
        if (AESKey.err) return yield new DecryptError(ErrorReasons.PayloadBroken, AESKey.val)
        if (iv.err) return yield new DecryptError(ErrorReasons.PayloadBroken, iv.val)
        // Not calling setPostCache here. It's public post and saving key is wasting storage space.
        return yield* decryptWithPostAESKey(version, AESKey.val.key as AESCryptoKey, iv.val, encrypted)
    } else if (encryption.type === 'E2E') {
        const { ephemeralPublicKey, iv: _iv, ownersAESKeyEncrypted } = encryption
        if (_iv.err) return yield new DecryptError(ErrorReasons.PayloadBroken, _iv.val)
        const iv = _iv.val
        const author = _author.unwrapOr(None)

        // ! Try to decrypt this post as author (using ownersAESKeyEncrypted field)
        // #region
        const hasAuthorLocalKey = author.some ? io.hasLocalKeyOf(author.val).catch(() => false) : Promise.resolve(false)
        if (ownersAESKeyEncrypted.ok) {
            try {
                const aes_raw = await io.decryptByLocalKey(author.unwrapOr(null), ownersAESKeyEncrypted.val, iv)
                const aes = await importAESKeyFromJWKFromTextEncoder(aes_raw)
                io.setPostKeyCache(aes).catch(() => {})
                return yield* decryptWithPostAESKey(version, aes, iv, encrypted)
            } catch (err) {
                if (await hasAuthorLocalKey) {
                    // If we fall into this branch, it means we failed to decrypt as author.
                    // Since we will not ECDHE to myself when encrypting,
                    // it does not make sense to try the following steps (because it will never have a result).
                    return yield new DecryptError(ErrorReasons.CannotDecryptAsAuthor, err)
                }
                // fall through
            }
        } else {
            if (await hasAuthorLocalKey) {
                // If the ownersAESKeyEncrypted is corrupted and we're the author, we cannot do anything to continue.
                return yield new DecryptError(ErrorReasons.CannotDecryptAsAuthor, ownersAESKeyEncrypted.val)
            }
            // fall through
        }
        // #endregion

        // ! Try to decrypt this post via ECDH
        // #region
        const authorPublicKey = _authorPublicKey.unwrapOr(None)
        if (version === -37) {
            return yield* v37ECDHE(io, ephemeralPublicKey, iv, encrypted, options.signal)
        } else {
            // Static ECDH
            // to do static ECDH, we need to have the authors public key first. bail if not found.
            const authorECPub = await Result.wrapAsync(async () => {
                if (authorPublicKey.some) return authorPublicKey.val.key as EC_Public_CryptoKey
                return io.queryAuthorPublicKey(author.unwrapOr(null), options.signal)
            })
            if (authorECPub.err) return yield new DecryptError(ErrorReasons.AuthorPublicKeyNotFound, authorECPub.val)
            if (!authorECPub.val) return yield new DecryptError(ErrorReasons.AuthorPublicKeyNotFound, undefined)
            return yield* v38To40StaticECDH(version, io, authorECPub.val, iv, encrypted, options.signal)
        }
        // #endregion
    }
    unreachable(encryption)
}

async function* v37ECDHE(
    io: DecryptIO,
    inlinedECDHE: PayloadParseResult.EndToEndEncryption['ephemeralPublicKey'],
    iv: Uint8Array,
    encrypted: Uint8Array,
    signal: AbortSignal | undefined,
) {
    // for each inlinedECDHE pub, derive a set of AES key.
    const inlinedECDHE_derived = Promise.all(
        Object.values(inlinedECDHE)
            .map((x) => x.unwrapOr(null!))
            .filter(Boolean)
            .map((x) => io.deriveAESKey(x.key as EC_Public_CryptoKey)),
    ).then((x) => x.flat())

    return yield* decryptByECDH(
        -37,
        io,
        io.queryPostKey_version37(iv, signal),
        {
            type: 'ephemeral',
            derive: (key) => (key ? io.deriveAESKey(key) : inlinedECDHE_derived),
        },
        iv,
        encrypted,
    )
}

async function* v38To40StaticECDH(
    version: -38 | -39 | -40,
    io: DecryptIO,
    authorECPub: EC_Public_CryptoKey,
    iv: Uint8Array,
    encrypted: Uint8Array,
    signal: AbortSignal | undefined,
): AsyncIterableIterator<DecryptProgress> {
    const postAESKeyIterator = {
        '-40': async function* (iv: Uint8Array) {
            const val = await io.queryPostKey_version40(iv)
            if (val) yield val
        },
        '-39': io.queryPostKey_version39,
        '-38': io.queryPostKey_version38,
    }[version](iv, signal)

    return yield* decryptByECDH(
        version,
        io,
        postAESKeyIterator,
        {
            type: 'static-v38-or-older',
            derive: (postKeyIV) => io.deriveAESKey_version38_or_older(authorECPub, postKeyIV),
        },
        iv,
        encrypted,
    )
}

async function* decryptByECDH(
    version: Version,
    io: DecryptIO,
    possiblePostKeyIterator: AsyncIterableIterator<DecryptEphemeralECDH_PostKey>,
    ecdhProvider:
        | {
              type: 'static-v38-or-older'
              derive: (postKeyIV: Uint8Array) => Promise<readonly [key: AESCryptoKey, iv: Uint8Array][]>
          }
        // it's optional argument because the ephemeralPublicKey maybe inlined in the post payload.
        | { type: 'ephemeral'; derive: (ephemeralPublicKey?: EC_Public_CryptoKey) => Promise<AESCryptoKey[]> },
    iv: Uint8Array,
    encrypted: Uint8Array,
) {
    const { derive, type } = ecdhProvider
    for await (const _ of possiblePostKeyIterator) {
        const { encryptedPostKey, postKeyIV, ephemeralPublicKey } = _
        // TODO: how to deal with signature?
        // TODO: what to do if provider throws?
        const derivedKeys =
            type === 'static-v38-or-older'
                ? await derive(postKeyIV)
                : await derive(ephemeralPublicKey).then((aesArr) => aesArr.map((aes) => [aes, iv] as const))
        for (const [derivedKey, derivedKeyNewIV] of derivedKeys) {
            const possiblePostKey = await andThenAsync(
                decryptWithAES(AESAlgorithmEnum.A256GCM, derivedKey, derivedKeyNewIV, encryptedPostKey),
                (postKeyRaw) => Result.wrapAsync(() => importAESKeyFromJWKFromTextEncoder(postKeyRaw)),
            )
            if (possiblePostKey.err) continue
            const decrypted = await decryptWithAES(AESAlgorithmEnum.A256GCM, possiblePostKey.val, iv, encrypted)
            if (decrypted.err) continue

            io.setPostKeyCache(possiblePostKey.val).catch(() => {})
            // If we'd able to decrypt the raw message, we will stop here.
            // because try further key cannot resolve the problem of parseTypedMessage failed.
            return yield* parseTypedMessage(version, decrypted.val)
        }
    }
    return void (yield new DecryptError(ErrorReasons.NotShareTarget, undefined))
}

async function* decryptWithPostAESKey(
    version: Version,
    postAESKey: AESCryptoKey,
    iv: Uint8Array,
    encrypted: Uint8Array,
): AsyncIterableIterator<DecryptProgress> {
    const { err, val } = await decryptWithAES(AESAlgorithmEnum.A256GCM, postAESKey, iv, encrypted)
    if (err) return yield new DecryptError(ErrorReasons.DecryptFailed, val)
    return yield* parseTypedMessage(version, val)
}

async function* parseTypedMessage(version: Version, raw: Uint8Array): AsyncIterableIterator<DecryptProgress> {
    const { err, val } =
        version === -37 ? decodeTypedMessageFromDocument(raw) : decodeTypedMessageV38ToV40Format(raw, version)
    if (err) return yield new DecryptError(ErrorReasons.PayloadDecryptedButTypedMessageBroken, val)
    return yield progress(DecryptProgressKind.Success, { content: val })
}

// uint8 |> TextDecoder |> JSON.parse |> importAESKeyFromJWK
async function importAESKeyFromJWKFromTextEncoder(aes_raw: Uint8Array) {
    const aes_text = new TextDecoder().decode(aes_raw)
    const aes_jwk = JSON.parse(aes_text)
    return (await importAESFromJWK.AES_GCM_256(aes_jwk)).unwrap()
}

function progress(kind: DecryptProgressKind.Success, rest: Omit<DecryptSuccess, 'type'>): DecryptSuccess
function progress(kind: DecryptProgressKind.Started): DecryptProgress
function progress(kind: DecryptProgressKind, rest?: object): DecryptProgress {
    return { type: kind, ...rest } as any
}
