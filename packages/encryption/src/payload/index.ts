import type { Result } from 'ts-results'
import type { PayloadWellFormed } from '..'
import { encode37, encode38, parse37, parse38, parse39, parse40, PayloadParserResult } from '../payload_internal'
import { EKindsError as Err, EKinds, EKindsError } from '../types'

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

export function encodePayload(
    payload: PayloadWellFormed.Payload,
    sign: (payload: ArrayBuffer) => Promise<Result<ArrayBuffer, any>>,
) {
    if (payload.version === -38) return encode38(payload)
    else if (payload.version === -37) return encode37(payload, sign)
    return new EKindsError(EKinds.EncodeFailed, 'unsupported payload version').toErr()
}
