import { unreachable } from '@dimensiondev/kit'
import {
    TypedMessage,
    decodeTypedMessageFromDocument,
    decodeTypedMessageV38ToV40Format,
    ProfileIdentifier,
    AESCryptoKey,
} from '@masknet/shared-base'
import { None, Result } from 'ts-results'
import type { PayloadParseResult } from '../payload'

export async function* decrypt(options: DecryptionOption, io: DecryptIO): AsyncIterableIterator<DecryptionProcess> {
    yield progress(K.Started)

    const { author: _author, encrypted: _encrypted, encryption: _encryption, version } = options.message

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
        // Try to decrypt as author/whoAmI
        const { ephemeralPublicKey, iv: _iv, ownersAESKeyEncrypted } = encryption
        if (_iv.err) return yield new DecryptionError(ErrorReasons.PayloadBroken, _iv.val)
        const iv = _iv.val

        // Try to decrypt this post as author (using ownersAESKeyEncrypted field)
        const author = _author.unwrapOr(None)
        const hasAuthorLocalKey = author.some ? io.hasLocalKeyOf(author.val).catch(() => false) : Promise.resolve(false)
        if (ownersAESKeyEncrypted.ok) {
            try {
                const aes_raw = await io.decryptByLocalKey(author.unwrapOr(null), ownersAESKeyEncrypted.val, iv)
                const aes_text = new TextDecoder().decode(aes_raw)
                const aes_jwk = JSON.parse(aes_text)
                const aes = (await crypto.subtle.importKey('jwk', aes_jwk, { name: 'AES-GCM', length: 256 }, false, [
                    'decrypt',
                ])) as AESCryptoKey
                return yield* decryptWithPostAESKey(version, aes, encrypted, iv, io)
            } catch (err) {
                if (await hasAuthorLocalKey) {
                    // If we fall into this branch, it means we failed to decrypt as author.
                    // Since we will not ECDHE to myself when encrypting,
                    // it does not make sense to try the following steps (because it will never have a result).
                    return yield new DecryptionError(ErrorReasons.CannotDecryptAsAuthor, err)
                }
            }
        } else {
            if (await hasAuthorLocalKey) {
                // If the ownersAESKeyEncrypted is corrupted and we're the author, we cannot do anything to continue.
                return yield new DecryptionError(ErrorReasons.CannotDecryptAsAuthor, ownersAESKeyEncrypted.val)
            }
        }
        throw new Error('TODO')
    }
    unreachable(encryption)
}

async function* decryptWithPostAESKey(
    version: Version,
    postAESKey: AESCryptoKey,
    encrypted: Uint8Array,
    iv: Uint8Array,
    io: DecryptIO,
): AsyncIterableIterator<DecryptionProcess> {
    const { err, val } = await Result.wrapAsync(() =>
        crypto.subtle.decrypt({ name: 'AES-GCM', iv }, postAESKey, encrypted),
    )
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
    return progress(K.Success, { content: val })
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
}
export class DecryptionError extends Error {
    static Reasons = ErrorReasons
    type = DecryptionProgressKind.Error
    constructor(public override message: ErrorReasons, cause: unknown, public recoverable = false) {
        super(message, { cause })
    }
}
type Version = PayloadParseResult.Payload['version']
