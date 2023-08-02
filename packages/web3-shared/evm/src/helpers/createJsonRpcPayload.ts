import type { JsonRpcPayload } from 'web3-core-helpers'
import type { RequestArguments } from '../types/index.js'

export function createJsonRpcPayload(id: number, requestArguments: RequestArguments): JsonRpcPayload {
    return {
        jsonrpc: '2.0',
        id,
        method: requestArguments.method,
        params: requestArguments.params,
    }
}
