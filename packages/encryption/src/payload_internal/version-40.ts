import type { PayloadParseResult, Signature } from '../payload'
import { Ok } from 'ts-results'
import { Exception, ExceptionKinds, OptionalResult } from '../types'
import { decodeArrayBufferF, encodeTextF, ensureIVLength16 } from '../utils'
import type { PayloadParserResult } from '.'

const decodeArrayBuffer = decodeArrayBufferF(ExceptionKinds.InvalidPayload, ExceptionKinds.DecodeFailed)
const encodeText = encodeTextF(ExceptionKinds.InvalidPayload, ExceptionKinds.DecodeFailed)
// ? Payload format: (text format)
// ? Version 40:🎼2/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||
// ? Older version is lacking of signature, like:
// ? Version 40:🎼2/4|ownersAESKeyEncrypted|iv|encryptedText:||
export async function parse40(payload: string): PayloadParserResult {
    //#region Parse string
    if (!payload.startsWith('🎼2/4|')) return new Exception(ExceptionKinds.DecodeFailed, 'Unknown version').toErr()
    let rest = payload.slice(6)
    // cut the tail
    rest = rest.slice(0, rest.lastIndexOf(':||'))

    const [ownersAESKeyEncrypted, iv, encryptedText, signature] = rest.split('|')
    //#endregion

    //#region Normalization
    const encryption: PayloadParseResult.EndToEndEncryption = {
        type: 'E2E',
        ephemeralPublicKey: {},
        iv: decodeArrayBuffer(iv).andThen(ensureIVLength16),
        ownersAESKeyEncrypted: decodeArrayBuffer(ownersAESKeyEncrypted),
    }
    const normalized: PayloadParseResult.Payload = {
        version: -40,
        author: OptionalResult.None,
        authorPublicKey: OptionalResult.None,
        signature: OptionalResult.None,
        encryption: Ok(encryption),
        encrypted: decodeArrayBuffer(encryptedText),
    }
    if (signature && encryption.iv.ok && encryption.ownersAESKeyEncrypted.ok && normalized.encrypted.ok) {
        const message = encodeText(`4/4|${ownersAESKeyEncrypted}|${iv}|${encryptedText}`)
        const sig = decodeArrayBuffer(signature)
        if (message.ok && sig.ok) {
            normalized.signature = OptionalResult.Some<Signature>([message.val, sig.val])
        } else if (sig.err) {
            normalized.signature = sig
        } else if (message.err) {
            normalized.signature = message
        }
    }
    return Ok(normalized)
    //#endregion
}
