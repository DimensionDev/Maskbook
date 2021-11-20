import { Ok, Result } from 'ts-results'
import type { Signature } from '..'
import { assertArray, assertUint8Array, PayloadException, EKindsError, OptionalResult } from '../types'
import { decodeMessagePackF, encodeMessagePack } from '../utils'

const decode = decodeMessagePackF(PayloadException.InvalidPayload, PayloadException.DecodeFailed)
export function encodeSignatureContainer(payload: Uint8Array, signature: Uint8Array | null) {
    const container = [0, payload, signature]
    return encodeMessagePack(container)
}
export interface SignatureContainer {
    payload: Uint8Array
    signature: OptionalResult<Signature, PayloadException>
}

export function parseSignatureContainer(
    signatureContainer: Uint8Array,
): Result<SignatureContainer, EKindsError<PayloadException>> {
    return decode(signatureContainer)
        .andThen(assertArray('SignatureContainer', PayloadException.InvalidPayload))
        .andThen(([version, rawPayload, rawSignature]) => {
            if (version !== 0)
                return new EKindsError(PayloadException.UnknownVersion, 'Unknown Signature container version').toErr()
            return assertUint8Array(rawPayload, 'SignatureContainer[1]', PayloadException.InvalidPayload).andThen(
                (payload) => {
                    if (rawSignature === null) return Ok({ payload, signature: OptionalResult.None })
                    const signature = assertUint8Array(
                        rawSignature,
                        'SignatureContainer[2]',
                        PayloadException.InvalidPayload,
                    ).andThen((sig) => OptionalResult.Some<Signature>({ signature: sig, signee: payload }))
                    return Ok({ payload, signature })
                },
            )
        })
}
