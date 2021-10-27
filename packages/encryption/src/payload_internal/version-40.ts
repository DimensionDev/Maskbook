import type { PayloadParseResult, Signature } from '../payload'
import { Ok } from 'ts-results'
import { EKindsError as Err, EKinds, OptionalResult } from '../types'
import { decodeArrayBufferF, assertIVLengthEq16 } from '../utils'
import type { PayloadParserResult } from '.'
import { encodeText } from '@dimensiondev/kit'

const decodeArrayBuffer = decodeArrayBufferF(EKinds.InvalidPayload, EKinds.DecodeFailed)
// ? Payload format: (text format)
// ? Version 40:🎼2/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||
// ? Older version is lacking of signature, like:
// ? Version 40:🎼2/4|ownersAESKeyEncrypted|iv|encryptedText:||
export async function parse40(payload: string): PayloadParserResult {
    //#region Parse string
    const header = '🎼2/4|'
    if (!payload.startsWith(header)) return new Err(EKinds.DecodeFailed, 'Unknown version').toErr()
    let rest = payload.slice(header.length)
    // cut the tail
    rest = rest.slice(0, rest.lastIndexOf(':||'))

    const [ownersAESKeyEncrypted, iv, encryptedText, signature] = rest.split('|')
    //#endregion

    //#region Normalization
    const encryption: PayloadParseResult.EndToEndEncryption = {
        type: 'E2E',
        ephemeralPublicKey: {},
        iv: decodeArrayBuffer(iv).andThen(assertIVLengthEq16),
        ownersAESKeyEncrypted: decodeArrayBuffer(ownersAESKeyEncrypted),
    }
    const normalized: Readwrite<PayloadParseResult.Payload> = {
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
        if (sig.ok) {
            normalized.signature = OptionalResult.Some<Signature>({ signee: message, signature: sig.val })
        } else {
            normalized.signature = sig
        }
    }
    return Ok(normalized)
    //#endregion
}
