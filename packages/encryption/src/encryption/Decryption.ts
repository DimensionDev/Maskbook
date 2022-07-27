import { unreachable } from '@dimensiondev/kit'
import { decodeTypedMessageFromDocument, decodeTypedMessageV38ToV40Format, TypedMessage } from '@masknet/typed-message'
import { AESCryptoKey, EC_Public_CryptoKey, andThenAsync } from '@masknet/shared-base'
import { None, Result } from 'ts-results'
import type { PayloadParseResult } from '../payload'
import { decryptWithAES, importAES } from '../utils'
import {
    DecryptOptions,
    DecryptIO,
    DecryptProgress,
    DecryptProgressKind,
    DecryptError,
    DecryptEphemeralECDH_PostKey,
    DecryptSuccess,
    DecryptIntermediateProgress,
    DecryptIntermediateProgressKind,
    DecryptStaticECDH_PostKey,
} from './DecryptionTypes'
import { deriveAESByECDH_version38OrOlderExtraSteps } from './v38-ecdh'
export * from './DecryptionTypes'
const ErrorReasons = DecryptError.Reasons
type Version = PayloadParseResult.Payload['version']
export async function* decrypt(options: DecryptOptions, io: DecryptIO): AsyncIterableIterator<DecryptProgress> {
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
        if (cacheKey && iv) return yield* decryptWithPostAESKey(version, cacheKey, iv, encrypted, options.onDecrypted)
    }

    if (encryption.type === 'public') {
        const { AESKey, iv } = encryption
        if (AESKey.err) return yield new DecryptError(ErrorReasons.PayloadBroken, AESKey.val)
        if (iv.err) return yield new DecryptError(ErrorReasons.PayloadBroken, iv.val)
        // Not calling setPostCache here. It's public post and saving key is wasting storage space.
        return yield* decryptWithPostAESKey(version, AESKey.val, iv.val, encrypted, options.onDecrypted)
    } else if (encryption.type === 'E2E') {
        const { iv: _iv, ownersAESKeyEncrypted } = encryption
        if (_iv.err) return yield new DecryptError(ErrorReasons.PayloadBroken, _iv.val)
        const iv = _iv.val
        const author = _author.unwrapOr(None)

        // #region // ! decrypt by local key. This only happens in v38 or older.
        if (options.message.version <= -38) {
            const hasAuthorLocalKey = author.some
                ? io.hasLocalKeyOf(author.val).catch(() => false)
                : Promise.resolve(false)
            if (ownersAESKeyEncrypted.ok) {
                try {
                    const aes_raw = new Uint8Array(
                        await io.decryptByLocalKey(author.unwrapOr(null), ownersAESKeyEncrypted.val, iv),
                    )
                    const aes = await importAESKeyFromJWKFromTextEncoder(aes_raw)
                    io.setPostKeyCache(aes.unwrap()).catch(() => {})
                    return yield* decryptWithPostAESKey(version, aes.unwrap(), iv, encrypted, options.onDecrypted)
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
        }
        // #endregion

        // #region // ! decrypt by ECDH
        const authorPublicKey = _authorPublicKey.unwrapOr(None)
        yield progress(DecryptProgressKind.Progress, { event: DecryptIntermediateProgressKind.TryDecryptByE2E })
        if (version === -37) {
            return yield* v37ECDHE(io, encryption, encrypted, options.signal, options.onDecrypted)
        } else {
            // Static ECDH
            // to do static ECDH, we need to have the authors public key first. bail if not found.
            const authorECPub = await Result.wrapAsync(async () => {
                if (authorPublicKey.some) return authorPublicKey.val.key as EC_Public_CryptoKey
                return io.queryAuthorPublicKey(author.unwrapOr(null), options.signal)
            })
            if (authorECPub.err) return yield new DecryptError(ErrorReasons.AuthorPublicKeyNotFound, authorECPub.val)
            if (!authorECPub.val) return yield new DecryptError(ErrorReasons.AuthorPublicKeyNotFound, undefined)
            return yield* v38To40StaticECDH(
                version,
                io,
                authorECPub.val,
                iv,
                encrypted,
                options.signal,
                options.onDecrypted,
            )
        }
        // #endregion
    }
    unreachable(encryption)
}

async function* v37ECDHE(
    io: DecryptIO,
    encryption: PayloadParseResult.EndToEndEncryption,
    encrypted: Uint8Array,
    signal: AbortSignal | undefined,
    report: ((message: TypedMessage) => void) | undefined,
) {
    // checked before
    const iv = encryption.iv.unwrap()
    // for each inlinedECDHE pub, derive a set of AES key.
    const inlinedECDHE_derived = Promise.all(
        Object.values(encryption.ephemeralPublicKey)
            .map((x) => x.unwrapOr(null!))
            .filter(Boolean)
            .map((x) => io.deriveAESKey(x.key as EC_Public_CryptoKey)),
    ).then((x) => x.flat())

    async function* postKey() {
        if (encryption.ownersAESKeyEncrypted.ok) {
            const key: DecryptEphemeralECDH_PostKey = {
                encryptedPostKey: encryption.ownersAESKeyEncrypted.val,
            }
            yield key
        }
        yield* io.queryPostKey_version37(iv, signal)
    }

    const ecdh: EphemeralECDH = {
        type: 'ephemeral',
        derive: (key) => (key ? io.deriveAESKey(key) : inlinedECDHE_derived),
    }
    return yield* decryptByECDH(-37, io, postKey(), ecdh, importAESKeyFromRaw, iv, encrypted, report)
}

async function* v38To40StaticECDH(
    version: -38 | -39 | -40,
    io: DecryptIO,
    authorECPub: EC_Public_CryptoKey,
    iv: Uint8Array,
    encrypted: Uint8Array,
    signal: AbortSignal | undefined,
    report: ((message: TypedMessage) => void) | undefined,
): AsyncIterableIterator<DecryptProgress> {
    const postKey = {
        async *'-40'(iv: Uint8Array) {
            const val = await io.queryPostKey_version40(iv)
            if (val) yield val
        },
        '-39': io.queryPostKey_version39,
        '-38': io.queryPostKey_version38,
    }[version](iv, signal)

    const ecdh: StaticV38OrOlderECDH = {
        type: 'static-v38-or-older',
        derive: (postKeyIV) => deriveAESByECDH_version38OrOlderExtraSteps(io.deriveAESKey, authorECPub, postKeyIV),
    }
    return yield* decryptByECDH(version, io, postKey, ecdh, importAESKeyFromJWKFromTextEncoder, iv, encrypted, report)
}
type StaticV38OrOlderECDH = {
    type: 'static-v38-or-older'
    derive: (postKeyIV: Uint8Array) => Promise<Array<readonly [key: AESCryptoKey, iv: Uint8Array]>>
}
type EphemeralECDH = {
    type: 'ephemeral'
    // it's optional argument because the ephemeralPublicKey maybe inlined in the post payload.
    derive: (ephemeralPublicKey?: EC_Public_CryptoKey) => Promise<AESCryptoKey[]>
}

async function* decryptByECDH(
    version: Version,
    io: DecryptIO,
    possiblePostKeyIterator: AsyncIterableIterator<DecryptEphemeralECDH_PostKey | DecryptStaticECDH_PostKey>,
    ecdhProvider: StaticV38OrOlderECDH | EphemeralECDH,
    postKeyDecoder: (raw: Uint8Array) => Promise<Result<AESCryptoKey, unknown>>,
    iv: Uint8Array,
    encrypted: Uint8Array,
    report: ((message: TypedMessage) => void) | undefined,
) {
    const { derive, type } = ecdhProvider
    for await (const _ of possiblePostKeyIterator) {
        const { encryptedPostKey } = _
        // TODO: how to deal with signature?
        // TODO: what to do if provider throws?
        const derivedKeys =
            type === 'static-v38-or-older'
                ? await derive((_ as DecryptStaticECDH_PostKey).postKeyIV || iv)
                : await derive((_ as DecryptEphemeralECDH_PostKey).ephemeralPublicKey).then((aesArr) =>
                      // TODO: we reuse iv in ephemeral mode, is that safe?
                      aesArr.map((aes) => [aes, iv] as const),
                  )
        for (const [derivedKey, derivedKeyNewIV] of derivedKeys) {
            const possiblePostKey = await andThenAsync(
                decryptWithAES(derivedKey, derivedKeyNewIV, encryptedPostKey),
                postKeyDecoder,
            )
            if (possiblePostKey.err) continue
            const decrypted = await decryptWithAES(possiblePostKey.val, iv, encrypted)
            if (decrypted.err) continue

            io.setPostKeyCache(possiblePostKey.val).catch(() => {})
            // If we'd able to decrypt the raw message, we will stop here.
            // because try further key cannot resolve the problem of parseTypedMessage failed.
            return yield* parseTypedMessage(version, decrypted.val, report)
        }
    }
    return void (yield new DecryptError(ErrorReasons.NotShareTarget, undefined))
}

async function* decryptWithPostAESKey(
    version: Version,
    postAESKey: AESCryptoKey,
    iv: Uint8Array,
    encrypted: Uint8Array,
    report: ((message: TypedMessage) => void) | undefined,
): AsyncIterableIterator<DecryptProgress> {
    const { err, val } = await decryptWithAES(postAESKey, iv, encrypted)
    if (err) return yield new DecryptError(ErrorReasons.DecryptFailed, val)
    return yield* parseTypedMessage(version, val, report)
}

async function* parseTypedMessage(
    version: Version,
    raw: Uint8Array,
    report: ((message: TypedMessage) => void) | undefined,
): AsyncIterableIterator<DecryptProgress> {
    const { err, val } =
        version === -37 ? decodeTypedMessageFromDocument(raw) : decodeTypedMessageV38ToV40Format(raw, version)
    if (err) return yield new DecryptError(ErrorReasons.PayloadDecryptedButTypedMessageBroken, val)
    try {
        report?.(val)
    } catch {}
    return yield progress(DecryptProgressKind.Success, { content: val })
}

// uint8 |> TextDecoder |> JSON.parse |> importAESKeyFromJWK
function importAESKeyFromJWKFromTextEncoder(aes_raw: Uint8Array) {
    return Result.wrapAsync(async () => {
        const aes_text = new TextDecoder().decode(aes_raw)
        const aes_jwk = JSON.parse(aes_text) as JsonWebKey
        if (!aes_jwk.key_ops!.includes('decrypt')) aes_jwk.key_ops!.push('decrypt')
        return (await importAES(aes_jwk)).unwrap()
    })
}

function importAESKeyFromRaw(aes_raw: Uint8Array) {
    return Result.wrapAsync(async () => {
        return crypto.subtle.importKey('raw', aes_raw, { name: 'AES-GCM', length: 256 }, false, [
            'decrypt',
        ]) as Promise<AESCryptoKey>
    })
}

function progress(kind: DecryptProgressKind.Success, rest: Omit<DecryptSuccess, 'type'>): DecryptSuccess
function progress(kind: DecryptProgressKind.Progress, rest: Omit<DecryptIntermediateProgress, 'type'>): DecryptSuccess
function progress(kind: DecryptProgressKind, rest?: object): DecryptProgress {
    return { type: kind, ...rest } as any
}
