import { unreachable } from '@dimensiondev/kit'
import {
    decodeTypedMessageFromDocument,
    decodeTypedMessageV38ToV40Format,
    AESCryptoKey,
    EC_Public_CryptoKey,
    andThenAsync,
} from '@masknet/shared-base'
import { None, Result } from 'ts-results'
import { AESAlgorithmEnum, PayloadParseResult } from '../payload'
import { decryptWithAES, importAESFromJWK } from '../utils'
import {
    DecryptionOption,
    DecryptIO,
    DecryptionProcess,
    DecryptionProgressKind,
    DecryptionError,
    EphemeralECDH_Result,
    DecryptionSuccess,
} from './DecryptionTypes'
const ErrorReasons = DecryptionError.Reasons

export async function* decrypt(options: DecryptionOption, io: DecryptIO): AsyncIterableIterator<DecryptionProcess> {
    yield progress(DecryptionProgressKind.Started)

    const { author: _author, encrypted: _encrypted, encryption: _encryption, version } = options.message
    const { authorPublicKey: _authorPublicKey } = options.message

    if (_encryption.err) return yield new DecryptionError(ErrorReasons.PayloadBroken, _encryption.val)
    if (_encrypted.err) return yield new DecryptionError(ErrorReasons.PayloadBroken, _encrypted.val)
    const encryption = _encryption.val
    const encrypted = _encrypted.val

    // ! try decrypt by cache
    {
        const cacheKey = await io.getPostKeyCache().catch(() => null)
        const iv = encryption.iv.unwrapOr(null)
        if (cacheKey && iv) return yield* decryptWithPostAESKey(version, cacheKey, encrypted, iv)
    }

    if (encryption.type === 'public') {
        const { AESKey, iv } = encryption
        if (AESKey.err) return yield new DecryptionError(ErrorReasons.PayloadBroken, AESKey.val)
        if (iv.err) return yield new DecryptionError(ErrorReasons.PayloadBroken, iv.val)
        // Not calling setPostCache here. It's public post and saving key is wasting storage space.
        return yield* decryptWithPostAESKey(version, AESKey.val.key as AESCryptoKey, encrypted, iv.val)
    } else if (encryption.type === 'E2E') {
        const { ephemeralPublicKey, iv: _iv, ownersAESKeyEncrypted } = encryption
        if (_iv.err) return yield new DecryptionError(ErrorReasons.PayloadBroken, _iv.val)
        const iv = _iv.val
        const author = _author.unwrapOr(None)

        // ! Try to decrypt this post as author (using ownersAESKeyEncrypted field)
        //#region
        const hasAuthorLocalKey = author.some ? io.hasLocalKeyOf(author.val).catch(() => false) : Promise.resolve(false)
        if (ownersAESKeyEncrypted.ok) {
            try {
                const aes_raw = await io.decryptByLocalKey(author.unwrapOr(null), ownersAESKeyEncrypted.val, iv)
                const aes = await importAESKeyFromJWKFromTextEncoder(aes_raw)
                io.setPostKeyCache(aes).catch(() => {})
                return yield* decryptWithPostAESKey(version, aes, encrypted, iv)
            } catch (err) {
                if (await hasAuthorLocalKey) {
                    // If we fall into this branch, it means we failed to decrypt as author.
                    // Since we will not ECDHE to myself when encrypting,
                    // it does not make sense to try the following steps (because it will never have a result).
                    return yield new DecryptionError(ErrorReasons.CannotDecryptAsAuthor, err)
                }
                // fall through
            }
        } else {
            if (await hasAuthorLocalKey) {
                // If the ownersAESKeyEncrypted is corrupted and we're the author, we cannot do anything to continue.
                return yield new DecryptionError(ErrorReasons.CannotDecryptAsAuthor, ownersAESKeyEncrypted.val)
            }
            // fall through
        }
        //#endregion

        // ! Try to decrypt this post by ECDHE
        //#region
        const authorPublicKey = _authorPublicKey.unwrapOr(None)
        if (version === -37) {
            return yield* v37ECDHE(iv, encrypted, ephemeralPublicKey, io, options.signal)
        } else {
            // Static ECDH
            // to do static ECDH, we need to have the authors public key first. bail if not found.
            const authorECPub = await Result.wrapAsync(async () => {
                if (authorPublicKey.some) return authorPublicKey.val.key as EC_Public_CryptoKey
                return io.queryPublicKey(author.unwrapOr(null), options.signal)
            })
            if (authorECPub.err) return yield new DecryptionError(ErrorReasons.AuthorPublicKeyNotFound, authorECPub.val)

            return yield* v38To40StaticECDH(version, io, authorECPub.val, iv, encrypted, options.signal)
        }
        //#endregion
    }
    unreachable(encryption)
}

async function* v37ECDHE(
    iv: Uint8Array,
    encrypted: Uint8Array,
    inlinedECDHE: PayloadParseResult.EndToEndEncryption['ephemeralPublicKey'],
    io: DecryptIO,
    signal: AbortSignal | undefined,
) {
    const inlinedECDHE_Result = Promise.all(
        Object.values(inlinedECDHE)
            .map((x) => x.unwrapOr(null!))
            .filter(Boolean)
            .map((x) => io.deriveAESKey(x.key as EC_Public_CryptoKey)),
    ).then((x) => x.flat())

    return yield* decryptByECDH(
        -37,
        io.queryPostKey_version37(iv, signal),
        {
            type: 'ephemeral',
            provider: (key) => (key ? io.deriveAESKey(key) : inlinedECDHE_Result),
        },
        iv,
        encrypted,
        io,
    )
}

async function* v38To40StaticECDH(
    version: -38 | -39 | -40,
    io: DecryptIO,
    authorECPub: EC_Public_CryptoKey,
    iv: Uint8Array,
    encrypted: Uint8Array,
    signal: AbortSignal | undefined,
): AsyncIterableIterator<DecryptionProcess> {
    // Cannot do ECDH if no private key
    const derivedKeys = await Result.wrapAsync(() => io.deriveAESKey(authorECPub))
    if (derivedKeys.err) return yield new DecryptionError(ErrorReasons.MyPrivateKeyNotFound, authorECPub)
    if (derivedKeys.val.length === 0) return yield new DecryptionError(ErrorReasons.MyPrivateKeyNotFound, undefined)

    // ECDH key derived. Now start looking for post AES key.

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
        postAESKeyIterator,
        { type: 'static', provider: derivedKeys.val },
        iv,
        encrypted,
        io,
    )
}

async function* decryptByECDH(
    version: Version,
    possiblePostKeyIterator: AsyncIterableIterator<EphemeralECDH_Result>,
    ecdhProvider:
        | { type: 'static'; provider: AESCryptoKey[] }
        // it's optional argument because the ephemeralPublicKey maybe inlined in the post payload.
        | { type: 'ephemeral'; provider: (ephemeralPublicKey?: EC_Public_CryptoKey) => Promise<AESCryptoKey[]> },
    iv: Uint8Array,
    encrypted: Uint8Array,
    io: DecryptIO,
) {
    const { provider, type } = ecdhProvider
    for await (const _ of possiblePostKeyIterator) {
        const { encryptedKey: encryptedPostKey, iv: postKeyIV, ephemeralPublicKey } = _
        // TODO: how to deal with signature?
        // TODO: what to do if provider return 0 AES key?
        // TODO: what to do if provider throws?
        const derivedKeys = await (type === 'static' ? provider : provider(ephemeralPublicKey))
        for (const derivedKey of derivedKeys) {
            const possiblePostKey = await andThenAsync(
                decryptWithAES(AESAlgorithmEnum.A256GCM, derivedKey, postKeyIV, encryptedPostKey),
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
    return void (yield new DecryptionError(ErrorReasons.NotShareTarget, undefined))
}

// uint8 |> TextDecoder |> JSON.parse |> importAESKeyFromJWK
async function importAESKeyFromJWKFromTextEncoder(aes_raw: Uint8Array) {
    const aes_text = new TextDecoder().decode(aes_raw)
    const aes_jwk = JSON.parse(aes_text)
    return (await importAESFromJWK.AES_GCM_256(aes_jwk)).unwrap()
}

async function* decryptWithPostAESKey(
    version: Version,
    postAESKey: AESCryptoKey,
    encrypted: Uint8Array,
    iv: Uint8Array,
): AsyncIterableIterator<DecryptionProcess> {
    const { err, val } = await decryptWithAES(AESAlgorithmEnum.A256GCM, postAESKey, iv, encrypted)
    if (err) return yield new DecryptionError(ErrorReasons.DecryptFailed, val)
    return yield* parseTypedMessage(version, val)
}

async function* parseTypedMessage(version: Version, raw: Uint8Array): AsyncIterableIterator<DecryptionProcess> {
    const { err, val } =
        version === -37 ? decodeTypedMessageFromDocument(raw) : decodeTypedMessageV38ToV40Format(raw, version)
    if (err) return yield new DecryptionError(ErrorReasons.PayloadDecryptedButNoValidTypedMessageIsFound, val)
    return yield progress(DecryptionProgressKind.Success, { content: val })
}

function progress(kind: DecryptionProgressKind.Success, rest: Omit<DecryptionSuccess, 'type'>): DecryptionSuccess
function progress(kind: DecryptionProgressKind.Started): DecryptionProcess
function progress(kind: DecryptionProgressKind, rest?: object): DecryptionProcess {
    return { type: kind, ...rest } as any
}
type Version = PayloadParseResult.Payload['version']
