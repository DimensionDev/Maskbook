import Web3 from 'web3'
import type { RequestArguments } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type { RequestOptions, SendOverrides } from '../types'

export function createExternalProvider(
    request: <T extends unknown>(
        requestArguments: RequestArguments,
        overrides?: SendOverrides,
        options?: RequestOptions,
    ) => Promise<T>,
    getOverrides?: () => SendOverrides,
    getOptions?: () => RequestOptions,
) {
    const send = (payload: JsonRpcPayload, callback: (error: Error | null, response?: JsonRpcResponse) => void) => {
        request(
            {
                method: payload.method,
                params: payload.params,
            },
            getOverrides?.(),
            getOptions?.(),
        ).then(
            (result) => {
                callback(null, {
                    jsonrpc: '2.0',
                    id: payload.id as number,
                    result,
                })
            },
            (error: unknown) => {
                if (error instanceof Error) callback(error)
            },
        )
    }

    return {
        isMetaMask: false,
        isMask: true,
        isStatus: true,
        host: '',
        path: '',
        request: (requestArguments: RequestArguments) => request(requestArguments, getOverrides?.(), getOptions?.()),
        send,
        sendAsync: send,
    }
}

export function createWeb3(
    request: <T extends unknown>(
        requestArguments: RequestArguments,
        overrides?: SendOverrides,
        options?: RequestOptions,
    ) => Promise<T>,
    getOverrides?: () => SendOverrides,
    getOptions?: () => RequestOptions,
) {
    return new Web3(createExternalProvider(request, getOverrides, getOptions))
}
