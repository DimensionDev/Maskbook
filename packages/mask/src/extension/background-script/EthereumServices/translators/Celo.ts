import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type { Translator } from '../types'

export class Celo implements Translator {
    encode(payload: JsonRpcPayload): JsonRpcPayload {
        throw new Error('Method not implemented.')
    }
    decode(error: Error | null, response?: JsonRpcResponse): [Error | null, JsonRpcResponse] {
        throw new Error('Method not implemented.')
    }
}
