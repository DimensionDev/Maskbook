import { parse37, parse38, parse39, parse40, PayloadParserResult } from '../payload_internal'
import { EKindsError as Err, EKinds } from '../types'

export * from './types'
export async function parsePayload(payload: unknown): PayloadParserResult {
    if (payload instanceof ArrayBuffer) {
        return parse37(payload)
    }
    if (typeof payload === 'string') {
        if (payload.startsWith('🎼4/4')) return parse38(payload)
        if (payload.startsWith('🎼3/4')) return parse39(payload)
        if (payload.startsWith('🎼2/4')) return parse40(payload)
    }
    return new Err(EKinds.InvalidPayload, 'Unknown version').toErr()
}
