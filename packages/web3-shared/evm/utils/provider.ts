import Web3 from 'web3'
import type { provider as Provider, RequestArguments } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type { Web3Provider } from '../types'

export function createWeb3(provider: Provider) {
    const web3 = new Web3(provider)
    web3.eth.transactionBlockTimeout = 10 * 1000
    web3.eth.transactionPollingTimeout = 10 * 1000
    // @ts-ignore disable the default polling strategy
    web3.eth.transactionPollingInterval = Number.MAX_SAFE_INTEGER
    return web3
}

export function createSignableWeb3(provider: Provider, keys: string[]) {
    const web3 = createWeb3(provider)
    if (keys.length) {
        web3.eth.accounts.wallet.clear()
        keys.forEach((k) => k && ['0x', '0x0'].includes(k) && web3.eth.accounts.wallet.add(k))
    }
    return web3
}

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
