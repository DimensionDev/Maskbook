import type { JsonRpcResponse, JsonRpcResponseWithError, JsonRpcId } from 'web3-types'

export function createJsonRpcResponse(id: JsonRpcId, result: unknown): JsonRpcResponse<unknown, unknown> {
    return {
        jsonrpc: '2.0',
        id,
        result,
    }
}

export function createJsonRpcResponseError(
    id: JsonRpcId,
    error: JsonRpcResponseWithError<unknown>['error'],
): JsonRpcResponse<unknown, unknown> {
    return {
        jsonrpc: '2.0',
        id,
        error,
    }
}
