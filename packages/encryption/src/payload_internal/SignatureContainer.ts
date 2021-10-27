import { encode } from '@msgpack/msgpack'
import { Ok } from 'ts-results'
import type { Signature } from '..'
import { assertArray, assertArrayBuffer, EKinds, EKindsError, OptionalResult } from '../types'
import { decodeMessagePackF } from '../utils'

const decode = decodeMessagePackF(EKinds.InvalidPayload, EKinds.DecodeFailed)
export function encodeSignatureContainer(payload: ArrayBuffer, signature: ArrayBuffer | null) {
    const container = [0, payload, signature]
    return encode(container)
}
export function parseSignatureContainer(payload: ArrayBuffer) {
    return decode(payload)
        .andThen(assertArray('SignatureContainer', EKinds.InvalidPayload))
        .andThen((item) => {
            const [version, payload, rawSignature] = item
            if (version !== 0) return new EKindsError(EKinds.InvalidPayload, 'Invalid version').toErr()
            return assertArrayBuffer(payload, 'SignatureContainer[1]', EKinds.InvalidPayload).andThen((payload) => {
                const signature =
                    rawSignature === null
                        ? OptionalResult.None
                        : assertArrayBuffer(rawSignature, 'SignatureContainer[2]', EKinds.InvalidPayload).andThen(
                              (sig) => OptionalResult.Some<Signature>({ signature: sig, signee: payload }),
                          )
                return Ok({ payload, signature })
            })
        })
}
