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
    yield progress(K.Started)

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

        // ! Try to decrypt this post as author (using ownersAESKeyEncrypted field)
        //#region
        const author = _author.unwrapOr(None)
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
        if (version === -40 || version === -39 || version === -38) {
            // Static ECDH
            const authorECPub = await Result.wrapAsync(async () =>
                authorPublicKey.some
                    ? (authorPublicKey.val.key as EC_Public_CryptoKey)
                    : io.queryPublicKey(author.unwrapOr(null), options.signal),
            )
            // Cannot do ECDH if no public key
            if (authorECPub.err) return yield new DecryptionError(ErrorReasons.AuthorPublicKeyNotFound, authorECPub.val)

            // Cannot do ECDH if no private key
            const derivedKeys = await Result.wrapAsync(() => io.deriveAESKey(authorECPub.val))
            if (derivedKeys.err) return yield new DecryptionError(ErrorReasons.MyPrivateKeyNotFound, authorECPub.val)
            if (derivedKeys.val.length === 0)
                return yield new DecryptionError(ErrorReasons.MyPrivateKeyNotFound, undefined)

            // ECDH key derived. Now start looking for post AES key.
            if (version === -40) {
                // version -40 does not support append share targer, therefore we only try once.
                try {
                    const key = await io.queryPostKey_version40(iv, author.map((x) => x.userId).unwrapOr(null))
                    if (key === null) return yield new DecryptionError(ErrorReasons.NotShareTarget, undefined)
                    const { encryptedKey, iv: ecdhIV } = key
                    for (const each of derivedKeys.val) {
                        if (options.signal?.aborted) return yield new DecryptionError(ErrorReasons.Aborted, undefined)
                        const trial = await decryptWithAES(AESAlgorithmEnum.A256GCM, each, ecdhIV, encryptedKey)
                        if (trial.err) continue
                        return yield* parseTypedMessage(version, io, trial.val)
                    }
                    return yield new DecryptionError(ErrorReasons.NotShareTarget, undefined)
                } catch (err) {
                    return yield new DecryptionError(ErrorReasons.NotShareTarget, err)
                }
            }
            throw new Error('TODO')
        } else if (version === -37) {
            // ECDHE
            throw new Error('TODO')
        }
        unreachable(version)
        //#endregion
    }
    unreachable(encryption)
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
    return yield progress(K.Success, { content: val })
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
    queryPostKey_version40(iv: Uint8Array, userID: string | null): Promise<StaticECDH_Result | null>
    queryPostKey_version39_version38(): Promise<StaticECDH_Result[]>
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
const K = DecryptionProgressKind
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
