import type { JsonRpcId, JsonRpcResponse, JsonRpcResponseWithError } from '@masknet/web3-shared-base'

export function createJsonRpcResponse(id: JsonRpcId, result: unknown): JsonRpcResponse {
    return {
        jsonrpc: '2.0',
        id,
        result,
    }
}

export function createJsonRpcResponseError(id: JsonRpcId, error: JsonRpcResponseWithError['error']): JsonRpcResponse {
    return {
        jsonrpc: '2.0',
        id,
        error,
    }
}
