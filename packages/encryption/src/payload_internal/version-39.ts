import { parse40 } from './version-40'
import { Exception, ExceptionKinds } from '../types'
import type { PayloadParserResult } from '.'

// -39 payload is exactally the same as -40.
// -40 uses unstable JSON stringify in E2E encryption, -39 fixes that.
// We can reuse the payload parser here.
// ? Payload format: (text format)
// ? Version 40:🎼2/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||
// ? Version 39:🎼3/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||

// ? Older version is lacking of signature, like:
// ? Version 40:🎼2/4|ownersAESKeyEncrypted|iv|encryptedText:||
// ? Version 39:🎼3/4|ownersAESKeyEncrypted|iv|encryptedText:||
export async function parse39(payload: string): PayloadParserResult {
    const _40 = '🎼2/4'
    const _39 = '🎼3/4'
    if (!payload.startsWith(_39)) return new Exception(ExceptionKinds.DecodeFailed, 'Unknown version').toErr()

    return (await parse40(payload.replace(_39, _40))).map((x) => ({ ...x, version: -39 }))
}
