import type { JsonRpcError, JsonRpcId, JsonRpcResponse, JsonRpcResponseWithError, JsonRpcResult } from 'web3-types'

export function createJsonRpcResponse(id: JsonRpcId, result: unknown): JsonRpcResponse {
    return {
        jsonrpc: '2.0',
        id,
        result: result as JsonRpcResult,
    }
}

export function createJsonRpcResponseError(id: JsonRpcId, error: unknown): JsonRpcResponseWithError {
    return {
        jsonrpc: '2.0',
        id,
        // TODO: this is incorrect. error should contain code, data and message.
        error: error as JsonRpcError,
    }
}
