import { TypedMessage, decodeTypedMessageFromDocument, decodeTypedMessageV38ToV40Format } from '@masknet/shared-base'
import type { PayloadParseResult } from '../payload'

export async function* decrypt(options: DecryptionOption, io: DecryptIO): AsyncIterableIterator<DecryptionProcess> {
    yield progress(K.Started)

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
