import { Ok, type Result } from 'ts-results-es'
import type { PayloadWellFormed } from '../index.js'
import {
    encode37,
    encode38,
    parse37,
    parse38,
    parse39,
    parse40,
    type PayloadParserResult,
} from '../payload_internal/index.js'
import { encodeSignatureContainer } from '../payload_internal/SignatureContainer.js'
import { PayloadException, type CryptoException } from '../types/index.js'
import { CheckedError, OptionalResult } from '@masknet/base'
export * from './types.js'

export async function parsePayload(payload: unknown): PayloadParserResult {
    if (payload instanceof Uint8Array) {
        return parse37(payload.slice())
    }
    if (typeof payload === 'string') {
        if (payload.startsWith('\u{1F3BC}4/4')) return parse38(payload)
        if (payload.startsWith('\u{1F3BC}3/4')) return parse39(payload)
        if (payload.startsWith('\u{1F3BC}2/4')) return parse40(payload)
    }
    return new CheckedError(PayloadException.UnknownVersion, null).toErr()
}

async function encodePayloadWithoutSignatureContainer(
    payload: PayloadWellFormed.Payload,
): Promise<Result<string | Uint8Array, CheckedError<CryptoException | PayloadException>>> {
    if (payload.version === -38) return encode38(payload)
    else if (payload.version === -37) return encode37(payload)

    const decodeOnly = payload.version === -39 || payload.version === -40 || payload.version === -41
    const errorMessage = decodeOnly ? `version ${payload.version} only supports decode.` : null
    return new CheckedError(PayloadException.UnknownVersion, errorMessage).toErr()
}

export async function encodePayload<E>(
    payload: PayloadWellFormed.Payload,
    sign: (payload: PayloadWellFormed.Payload, payloadToBeSigned: Uint8Array) => Promise<OptionalResult<Uint8Array, E>>,
): Promise<Result<string | Uint8Array, CheckedError<CryptoException | PayloadException | E>>> {
    if (payload.version === -37) {
        const bin = await encodePayloadWithoutSignatureContainer(payload)
        if (bin.isErr()) return bin

        if (typeof bin.value === 'string') throw new TypeError('This should never be string')
        const sig = await sign(payload, bin.value)
        if (sig.isErr()) return sig
        return Ok(encodeSignatureContainer(bin.value, sig.value.unwrapOr(null)))
    }
    const val = await encodePayloadWithoutSignatureContainer(payload)
    if (val.isOk() && typeof val.value !== 'string')
        throw new TypeError('This should always be a string for version < -37')
    return val
}
encodePayload.NoSign = ((payload: PayloadWellFormed.Payload) =>
    encodePayload(payload, async () => OptionalResult.None)) as typeof encodePayloadWithoutSignatureContainer
