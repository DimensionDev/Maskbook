/* eslint @dimensiondev/unicode-specific-set: ["error", { "only": "code" }] */
import { parse40 } from './version-40.js'
import { PayloadException } from '../types/index.js'
import type { PayloadParserResult } from './index.js'
import { CheckedError } from '@masknet/base'

// -39 payload is totally the same as -40.
// -40 uses unstable JSON stringify in E2E encryption, -39 fixes that.
// We can reuse the payload parser here.
// ? Payload format: (text format)
// ? Version 40:🎼2/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||
// ? Version 39:🎼3/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||

// ? Older version is lacking of signature, like:
// ? Version 40:🎼2/4|ownersAESKeyEncrypted|iv|encryptedText:||
// ? Version 39:🎼3/4|ownersAESKeyEncrypted|iv|encryptedText:||
export async function parse39(payload: string): PayloadParserResult {
    const v_40 = '\u{1F3BC}2/4'
    const v_39 = '\u{1F3BC}3/4'
    if (!payload.startsWith(v_39)) return new CheckedError(PayloadException.UnknownVersion, null).toErr()

    const result = await parse40(payload.replace(v_39, v_40))
    return result.map((x) => ({ ...x, version: -39 }))
}
