import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import {
    createJsonRpcResponse,
    type EthereumMethodType,
    type RequestArguments,
    type Web3Provider,
} from '@masknet/web3-shared-evm'

export function createWeb3ProviderFromRequest(
    request: <T>(requestArguments: RequestArguments) => Promise<T>,
): Web3Provider {
    const provider: Web3Provider = {
        on() {
            return provider
        },
        removeListener() {
            return provider
        },

        request,

        send(payload, callback: (error: Error | null, response?: JsonRpcResponse) => void) {
            return this.sendAsync(payload, callback)
        },
        // some pkg (eth-rpc) needs this method
        sendAsync: async (
            payload: JsonRpcPayload,
            callback: (error: Error | null, response?: JsonRpcResponse) => void,
        ) => {
            try {
                const result = await request({
                    method: payload.method as EthereumMethodType,
                    params: payload.params ?? [],
                })
                callback(null, createJsonRpcResponse(payload.id as number, result))
                return createJsonRpcResponse(payload.id as number, result)
            } catch (error) {
                if (error instanceof Error) callback(error)
                return createJsonRpcResponse(payload.id as number, undefined, error as Error)
            }
        },
    }
    return provider
}
