import { Ok, type Result } from 'ts-results-es'
import type { Signature } from '../index.js'
import { PayloadException } from '../types/index.js'
import { CheckedError, OptionalResult } from '@masknet/base'
import { concatArrayBuffer } from '@masknet/kit'

const enum SignaturePayloadFirstByte {
    NoSignature = 0,
    Signature = 1,
}
export function encodeSignatureContainer(payload: Uint8Array, signature: Uint8Array | null): Uint8Array {
    if (signature)
        return new Uint8Array(
            concatArrayBuffer(new Uint8Array([SignaturePayloadFirstByte.Signature]), signature, payload),
        )
    return new Uint8Array(concatArrayBuffer(new Uint8Array([SignaturePayloadFirstByte.NoSignature]), payload))
}
export interface SignatureContainer {
    payload: Uint8Array
    signature: OptionalResult<Signature, PayloadException>
}

export function parseSignatureContainer(
    signatureContainer: Uint8Array,
): Result<SignatureContainer, CheckedError<PayloadException>> {
    if (signatureContainer[0] === SignaturePayloadFirstByte.NoSignature) {
        return Ok({ payload: signatureContainer.slice(1), signature: OptionalResult.None })
    } else if (signatureContainer[0] === SignaturePayloadFirstByte.Signature) {
        const signature = signatureContainer.slice(1, 33)
        const payload = signatureContainer.slice(33)
        return Ok({ payload, signature: OptionalResult.Some<Signature>({ signature, signee: payload }) })
    } else return new CheckedError(PayloadException.InvalidPayload, 'Invalid signature container').toErr()
}
