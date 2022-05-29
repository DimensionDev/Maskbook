import type { RequestArguments } from 'web3-core'
import type { JsonRpcPayload } from 'web3-core-helpers'
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

        send(payload) {
            return this.sendAsync(payload)
        },
        // some pkg (eth-rpc) needs this method
        sendAsync: async (payload: JsonRpcPayload) => {
            try {
                const result = await request({
                    method: payload.method,
                    params: payload.params,
                })

                return {
                    jsonrpc: '2.0',
                    id: String(payload.id),
                    result,
                }
            } catch (error) {
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
