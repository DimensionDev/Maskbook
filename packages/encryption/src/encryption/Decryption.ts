import { unreachable } from '@dimensiondev/kit'
import {
    TypedMessage,
    decodeTypedMessageFromDocument,
    decodeTypedMessageV38ToV40Format,
    ProfileIdentifier,
    AESCryptoKey,
    EC_Public_CryptoKey,
} from '@masknet/shared-base'
import { None, Result } from 'ts-results'
import { AESAlgorithmEnum, PayloadParseResult } from '../payload'
import { decryptWithAES, importAESFromJWK } from '../utils'

export async function* decrypt(options: DecryptionOption, io: DecryptIO): AsyncIterableIterator<DecryptionProcess> {
    yield progress(DecryptionProgressKind.Started)

    const { author: _author, encrypted: _encrypted, encryption: _encryption, version } = options.message
    const { authorPublicKey: _authorPublicKey } = options.message

    if (_encryption.err) return yield new DecryptionError(ErrorReasons.PayloadBroken, _encryption.val)
    if (_encrypted.err) return yield new DecryptionError(ErrorReasons.PayloadBroken, _encrypted.val)
    const encryption = _encryption.val
    const encrypted = _encrypted.val

    if (encryption.type === 'public') {
        const { AESKey, iv } = encryption
        if (AESKey.err) return yield new DecryptionError(ErrorReasons.PayloadBroken, AESKey.val)
        if (iv.err) return yield new DecryptionError(ErrorReasons.PayloadBroken, iv.val)
        return yield* decryptWithPostAESKey(version, AESKey.val.key as AESCryptoKey, encrypted, iv.val, io)
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
                return yield* decryptWithPostAESKey(version, aes, encrypted, iv, io)
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
            throw new Error('TODO')
        } else {
            // Static ECDH
            // to do static ECDH, we need to have the authors public key first. bail if not found.
            const authorECPub = await Result.wrapAsync(async () => {
                if (authorPublicKey.some) return authorPublicKey.val.key as EC_Public_CryptoKey
                return io.queryPublicKey(author.unwrapOr(null), options.signal)
            })
            if (authorECPub.err) return yield new DecryptionError(ErrorReasons.AuthorPublicKeyNotFound, authorECPub.val)

            return yield* v38To40StaticECDH(version, io, authorECPub.val, iv, options.signal)
        }
        //#endregion
    }
    unreachable(encryption)
}

async function* v38To40StaticECDH(
    version: -38 | -39 | -40,
    io: DecryptIO,
    authorECPub: EC_Public_CryptoKey,
    iv: Uint8Array,
    signal: AbortSignal | undefined,
): AsyncIterableIterator<DecryptionProcess> {
    // Cannot do ECDH if no private key
    const derivedKeys = await Result.wrapAsync(() => io.deriveAESKey(authorECPub))
    if (derivedKeys.err) return yield new DecryptionError(ErrorReasons.MyPrivateKeyNotFound, authorECPub)
    if (derivedKeys.val.length === 0) return yield new DecryptionError(ErrorReasons.MyPrivateKeyNotFound, undefined)

    // ECDH key derived. Now start looking for post AES key.
    // version -40 does not support append share target, therefore we only try once.
    if (version === -40) {
        try {
            const postKeyEncrypted = await io.queryPostKey_version40(iv)
            if (postKeyEncrypted === null) return yield new DecryptionError(ErrorReasons.NotShareTarget, undefined)
            const { encryptedKey, iv: postKeyIV } = postKeyEncrypted
            for (const each of derivedKeys.val) {
                if (signal?.aborted) return yield new DecryptionError(ErrorReasons.Aborted, undefined)
                const decryptResult = await decryptWithAES(AESAlgorithmEnum.A256GCM, each, postKeyIV, encryptedKey)
                if (decryptResult.err) continue
                return yield* parseTypedMessage(version, io, decryptResult.val)
            }
            // no available key. no need to wait further. 万策尽きた
            return yield new DecryptionError(ErrorReasons.NotShareTarget, undefined)
        } catch (err) {
            return yield new DecryptionError(ErrorReasons.NotShareTarget, err)
        }
    } else {
        const k = version === -39 ? io.queryPostKey_version39(iv) : io.queryPostKey_version38(iv)
        throw new Error('TODO')
    }
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
    io: DecryptIO,
): AsyncIterableIterator<DecryptionProcess> {
    const { err, val } = await decryptWithAES(AESAlgorithmEnum.A256GCM, postAESKey, iv, encrypted)
    if (err) return yield new DecryptionError(ErrorReasons.DecryptFailed, val)
    return yield* parseTypedMessage(version, io, val)
}

async function* parseTypedMessage(
    version: Version,
    io: DecryptIO,
    raw: Uint8Array,
): AsyncIterableIterator<DecryptionProcess> {
    const { err, val } =
        version === -37 ? decodeTypedMessageFromDocument(raw) : decodeTypedMessageV38ToV40Format(raw, version)
    if (err) return yield new DecryptionError(ErrorReasons.PayloadDecryptedButNoValidTypedMessageIsFound, val)
    io.setCache(val).catch(() => {})
    return yield progress(DecryptionProgressKind.Success, { content: val })
}

function progress(kind: DecryptionProgressKind.Success, rest: Omit<DecryptionSuccess, 'type'>): DecryptionSuccess
function progress(kind: DecryptionProgressKind.Started): DecryptionProcess
function progress(kind: DecryptionProgressKind, rest?: object): DecryptionProcess {
    return { type: kind, ...rest } as any
}

export interface DecryptionOption {
    message: PayloadParseResult.Payload
    signal?: AbortSignal
}
export interface DecryptIO {
    setCache(result: TypedMessage): Promise<void>
    hasLocalKeyOf(author: ProfileIdentifier): Promise<boolean>
    /**
     * Try to decrypt message by someone's localKey.
     *
     * Implementor must try authorHint's localKey if they have access to.
     *
     * Implementor may try other localKeys they owned even not listed in the authorHint.
     *
     * @param authorHint A hint for searching the localKey.
     * @param data Encrypted data
     * @param iv
     * @returns The decrypted data
     */
    decryptByLocalKey(authorHint: ProfileIdentifier | null, data: Uint8Array, iv: Uint8Array): Promise<Uint8Array>
    queryPublicKey(id: ProfileIdentifier | null, signal?: AbortSignal): Promise<EC_Public_CryptoKey>
    queryPostKey_version40(iv: Uint8Array): Promise<StaticECDH_Result | null>
    queryPostKey_version39(iv: Uint8Array): Promise<StaticECDH_Result[]>
    queryPostKey_version38(iv: Uint8Array): Promise<StaticECDH_Result[]>
    queryPostKey_version37(): Promise<EphemeralECDH_Result[]>
    /**
     * Derive a group of AES key for ECDH.
     *
     * Implementor should derive a new AES-GCM key for each private key they have access to.
     * @param publicKey The public key used in ECDH
     */
    deriveAESKey(publicKey: EC_Public_CryptoKey): Promise<AESCryptoKey[]>
}
export interface StaticECDH_Result {
    encryptedKey: Uint8Array
    iv: Uint8Array
}
export interface EphemeralECDH_Result extends StaticECDH_Result {
    // It might be contained in the original payload.
    ephemeralPublicKey?: EC_Public_CryptoKey
    ephemeralPublicKeySignature?: Uint8Array
}
export enum DecryptionProgressKind {
    Started = 'started',
    Success = 'success',
    Error = 'error',
}
export type DecryptionProcess = { type: DecryptionProgressKind.Started } | DecryptionSuccess | DecryptionError
export interface DecryptionSuccess {
    type: DecryptionProgressKind.Success
    content: TypedMessage
}
enum ErrorReasons {
    PayloadBroken = '[@masknet/encryption] Payload is broken.',
    PayloadDecryptedButNoValidTypedMessageIsFound = '[@masknet/encryption] Payload decrypted, but no valid TypedMessage is found.',
    CannotDecryptAsAuthor = '[@masknet/encryption] Failed decrypt as the author of this payload.',
    DecryptFailed = '[@masknet/encryption] Post key found, but decryption failed.',
    AuthorPublicKeyNotFound = "[@masknet/encryption] Cannot found author's public key",
    MyPrivateKeyNotFound = '[@masknet/encryption] Cannot decrypt because there is no private key found.',
    NotShareTarget = '[@masknet/encryption] No valid key is found. Likely this post is not shared with you',
    Aborted = '[@masknet/encryption] Task aborted.',
}
export class DecryptionError extends Error {
    static Reasons = ErrorReasons
    readonly type = DecryptionProgressKind.Error
    constructor(public override message: ErrorReasons, cause: unknown, public recoverable = false) {
        super(message, { cause })
    }
}
type Version = PayloadParseResult.Payload['version']
