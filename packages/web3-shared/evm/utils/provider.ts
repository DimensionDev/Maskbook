import { noop } from 'lodash-unified'
import type { RequestArguments } from 'web3-core'
import type { JsonRpcPayload } from 'web3-core-helpers'
import type { Web3Provider } from '../types'

export function createWeb3Provider(request: <T>(requestArguments: RequestArguments) => Promise<T>): Web3Provider {
    return {
        // @ts-ignore
        on: noop,
        // @ts-ignore
        removeListener: noop,

        request,

        // some pkg (eth-rpc) needs this method
        sendAsync: async (payload: JsonRpcPayload) => {
            try {
                const result = await request({
                    method: payload.method,
                    params: payload.params,
                })

                return {
                    jsonrpc: '2.0',
                    id: payload.id as string,
                    result,
                }
            } catch (error) {
                return {
                    jsonrpc: '2.0',
                    id: payload.id as string,
                    error: error as Error,
                }
            }
        },
    }
}
