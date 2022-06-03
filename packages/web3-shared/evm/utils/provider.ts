import type { RequestArguments } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type { Web3Provider } from '../types'

export function createWeb3Provider(request: <T>(requestArguments: RequestArguments) => Promise<T>): Web3Provider {
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
                    method: payload.method,
                    params: payload.params,
                })
                callback(null, {
                    jsonrpc: '2.0',
                    id: String(payload.id),
                    result,
                })
                return {
                    jsonrpc: '2.0',
                    id: String(payload.id),
                    result,
                }
            } catch (error) {
                if (error instanceof Error) callback(error)
                return {
                    jsonrpc: '2.0',
                    id: String(payload.id),
                    error: error as Error,
                }
            }
        },
    }
    return provider
}
