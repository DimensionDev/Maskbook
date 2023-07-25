import Web3 from 'web3'
import type { provider as Provider } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type { EthereumMethodType, RequestArguments, Web3Provider } from '../types/index.js'

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

export function createWeb3FromProvider(provider: Provider) {
    const web3 = new Web3(provider)
    web3.eth.transactionBlockTimeout = 10 * 1000
    web3.eth.transactionPollingTimeout = 10 * 1000
    // @ts-expect-error private or untyped API?
    // disable the default polling strategy
    web3.eth.transactionPollingInterval = Number.MAX_SAFE_INTEGER
    return web3
}

export function createWeb3FromURL(url: string) {
    return createWeb3FromProvider(createWeb3ProviderFromURL(url))
}

export function createWeb3ProviderFromURL(url: string): Web3Provider {
    return createWeb3ProviderFromRequest((requestArguments) =>
        fetchJsonRpcResponse(url, {
            id: 0,
            jsonrpc: '2.0',
            ...requestArguments,
        }),
    )
}

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
