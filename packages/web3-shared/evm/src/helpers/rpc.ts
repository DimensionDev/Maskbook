import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type { RequestArguments } from '../types/index.js'

export function createJsonRpcPayload(id: number, requestArguments: RequestArguments): JsonRpcPayload {
    return {
        jsonrpc: '2.0',
        id,
        method: requestArguments.method,
        params: requestArguments.params,
    }
}

export function createJsonRpcResponse<T>(id: number, result?: T, error?: Error): JsonRpcResponse {
    return {
        jsonrpc: '2.0',
        id,
        result,
        error,
    }
}
