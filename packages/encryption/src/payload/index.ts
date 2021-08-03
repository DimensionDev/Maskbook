import { parse38, parse39, parse40, PayloadParserResult } from '../payload_internal'
import { Exception, ExceptionKinds } from '../types'

export * from './types'
export async function parsePayload(payload: unknown): PayloadParserResult {
    if (payload instanceof ArrayBuffer) {
        // TODO: version 37
    }
    if (typeof payload === 'string') {
        if (payload.startsWith('🎼4/4')) return parse38(payload)
        if (payload.startsWith('🎼3/4')) return parse39(payload)
        if (payload.startsWith('🎼2/4')) return parse40(payload)
    }
    return new Exception(ExceptionKinds.InvalidPayload, 'Unknown version').toErr()
}
