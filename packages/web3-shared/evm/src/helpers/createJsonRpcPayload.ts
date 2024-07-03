import type { JsonRpcRequest } from 'web3-types'
import type { RequestArguments } from '../types/index.js'

export function createJsonRpcPayload(id: number, requestArguments: RequestArguments): JsonRpcRequest {
    return {
        jsonrpc: '2.0',
        id,
        method: requestArguments.method,
        params: requestArguments.params,
    }
}
