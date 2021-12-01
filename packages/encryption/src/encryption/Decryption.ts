import { unreachable } from '@dimensiondev/kit'
import { TypedMessage, decodeTypedMessageFromDocument, makeTypedMessageText } from '@masknet/shared-base'
import { None, Result } from 'ts-results'
import type { PayloadParseResult } from '../payload'

export async function* decrypt(options: DecryptionOption, io: DecryptIO): AsyncIterableIterator<DecryptionProcess> {
    yield progress(K.Started)

    if (!options.disableCache) {
        const cache = await io.getCache(options.signal)
        if (cache) return yield progress(K.Success, { content: cache })
    }

    const {
        message: { author, authorPublicKey, encrypted, encryption, signature, version },
    } = options

    if (encryption.err) return yield new DecryptionError(ErrorReasons.PayloadBroken, encryption.val)
    if (encrypted.err) return yield new DecryptionError(ErrorReasons.PayloadBroken, encrypted.val)

    if (encryption.val.type === 'public') {
        const { AESKey, iv } = encryption.val
        if (AESKey.err) return yield new DecryptionError(ErrorReasons.PayloadBroken, AESKey.val)
        if (iv.err) return yield new DecryptionError(ErrorReasons.PayloadBroken, iv.val)

        const message = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv.val }, AESKey.val.key, encrypted.val)
        return yield* parseTypedMessage(version, io, message)
    }
    throw new Error('TODO')
}

async function* parseTypedMessage(
    version: PayloadParseResult.Payload['version'],
    io: DecryptIO,
    raw: Uint8Array,
): AsyncIterableIterator<DecryptionProcess> {
    if (version === -37) {
        const { err, val } = decodeTypedMessageFromDocument(raw)
        if (err) return yield new DecryptionError(ErrorReasons.PayloadDecryptedButNoValidTypedMessageIsFound, val)
        io.setCache(val).catch(() => {})
        return yield progress(K.Success, { content: val })
    } else if (version === -38) {
        const decoder = new TextDecoder()
        const { val, err } = Result.wrap(() => decoder.decode(raw))
        if (err) return yield new DecryptionError(ErrorReasons.PayloadDecryptedButNoValidTypedMessageIsFound, val)

        const maybeMetadata = (() => {
            if (!val.includes('🧩')) return None
            const [maybeJSON] = val.split('🧩')
            return Result.wrap(() => JSON.parse(maybeJSON))
                .toOption()
                .map((val) => {
                    if (typeof val !== 'object' || Array.isArray(val)) return new Map()
                    return new Map(Object.entries(val))
                })
        })()
        const tm = maybeMetadata.some
            ? makeTypedMessageText(val.replace(/.+🧩/, ''), maybeMetadata.val)
            : makeTypedMessageText(val)
        io.setCache(tm).catch(() => {})
        return yield progress(K.Success, { content: tm })
    } else if (version === -39 || version === -40) {
        const decoder = new TextDecoder()
        const { val, err } = Result.wrap(() => decoder.decode(raw)).map(makeTypedMessageText)
        if (err) return yield new DecryptionError(ErrorReasons.PayloadDecryptedButNoValidTypedMessageIsFound, val)

        io.setCache(val).catch(() => {})
        return yield progress(K.Success, { content: val })
    }
    unreachable(version)
}

function progress(kind: DecryptionProgressKind.Success, rest: Omit<DecryptionSuccess, 'type'>): DecryptionSuccess
function progress(kind: DecryptionProgressKind.Started): DecryptionProcess
function progress(kind: DecryptionProgressKind, rest?: object): DecryptionProcess {
    return { type: kind, ...rest } as any
}

export interface DecryptionOption {
    message: PayloadParseResult.Payload
    disableCache?: boolean
    signal?: AbortSignal
}
export interface DecryptIO {
    getCache(signal: AbortSignal | undefined): Promise<TypedMessage | null>
    setCache(result: TypedMessage): Promise<void>
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
}
export class DecryptionError extends Error {
    static Reasons = ErrorReasons
    type = DecryptionProgressKind.Error
    constructor(public override message: ErrorReasons, cause: unknown, public recoverable = false) {
        super(message, { cause })
    }
}
