import type { RequestArguments } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type { RequestOptions, SendOverrides } from '@masknet/web3-shared-evm'
import Services from '../extension/service'

export function createExternalProvider(getOverrides?: () => SendOverrides, getOptions?: () => RequestOptions) {
    const send = (payload: JsonRpcPayload, callback: (error: Error | null, response?: JsonRpcResponse) => void) => {
        Services.Ethereum.request(
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
    const request = (requestArguments: RequestArguments) =>
        Services.Ethereum.request(requestArguments, getOverrides?.(), getOptions?.())

    return {
        isMetaMask: false,
        isMask: true,
        isStatus: true,
        host: '',
        path: '',
        request: request,
        send,
        sendAsync: send,
    }
}
