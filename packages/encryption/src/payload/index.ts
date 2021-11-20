import { Ok, Result } from 'ts-results'
import type { PayloadWellFormed } from '..'
import { encode37, encode38, parse37, parse38, parse39, parse40, PayloadParserResult } from '../payload_internal'
import { encodeSignatureContainer } from '../payload_internal/SignatureContainer'
import { EKindsError as Err, EKindsError, PayloadException, CryptoException, OptionalResult } from '../types'

export * from './types'
export async function parsePayload(payload: unknown): PayloadParserResult {
    if (payload instanceof Uint8Array) {
        return parse37(payload.slice())
    }
    if (typeof payload === 'string') {
        if (payload.startsWith('🎼4/4')) return parse38(payload)
        if (payload.startsWith('🎼3/4')) return parse39(payload)
        if (payload.startsWith('🎼2/4')) return parse40(payload)
    }
    return new Err(PayloadException.UnknownVersion, null).toErr()
}

async function encodePayloadWithoutSignatureContainer(
    payload: PayloadWellFormed.Payload,
): Promise<Result<string | Uint8Array, EKindsError<CryptoException | PayloadException>>> {
    if (payload.version === -38) return encode38(payload)
    else if (payload.version === -37) return encode37(payload)

    const decodeOnly = payload.version === -39 || payload.version === -40 || payload.version === -41
    const errorMessage = decodeOnly ? `version ${payload.version} only supports decode.` : null
    return new EKindsError(PayloadException.UnknownVersion, errorMessage).toErr()
}

export async function encodePayload<E>(
    payload: PayloadWellFormed.Payload,
    sign: (payload: PayloadWellFormed.Payload, payloadToBeSigned: Uint8Array) => Promise<OptionalResult<Uint8Array, E>>,
): Promise<Result<string | Uint8Array, EKindsError<CryptoException | PayloadException | E>>> {
    if (payload.version === -37) {
        const bin = await encodePayloadWithoutSignatureContainer(payload)
        if (bin.err) return bin

        if (typeof bin.val === 'string') throw new TypeError('This should never be string')
        const sig = await sign(payload, bin.val)
        if (sig.err) return sig
        return Ok(encodeSignatureContainer(bin.val, sig.val.unwrapOr(null)))
    }
    const val = await encodePayloadWithoutSignatureContainer(payload)
    if (typeof val !== 'string') throw new TypeError('This should always be a string for version < -37')
    return val
}
encodePayload.NoSign = ((payload: PayloadWellFormed.Payload) =>
    encodePayload(payload, async () => OptionalResult.None)) as typeof encodePayloadWithoutSignatureContainer
