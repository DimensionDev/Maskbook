import type { JsonRpcRequest } from '@masknet/web3-shared-base'
import type { RequestArguments } from '../types/index.js'

export function createJsonRpcRequest(id: number, requestArguments: RequestArguments): JsonRpcRequest {
    return {
        jsonrpc: '2.0',
        id,
        method: requestArguments.method,
        params: requestArguments.params,
    }
}
