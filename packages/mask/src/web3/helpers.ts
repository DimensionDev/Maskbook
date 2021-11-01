import type { RequestArguments } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type { RequestOptions } from '../extension/background-script/EthereumService'
import type { SendOverrides } from '../extension/background-script/EthereumServices/send'
import Services from '../extension/service'

export function createExternalProvider(getOverrides?: () => SendOverrides, getOptions?: () => RequestOptions) {
    const requestSend = (
        payload: JsonRpcPayload,
        callback: (error: Error | null, response?: JsonRpcResponse) => void,
    ) => Services.Ethereum.requestSend(payload, callback, getOverrides?.(), getOptions?.())
    const request = (requestArguments: RequestArguments) =>
        Services.Ethereum.request(requestArguments, getOverrides?.(), getOptions?.())

    return {
        isMetaMask: false,
        isMask: true,
        isStatus: true,
        host: '',
        path: '',
        sendAsync: requestSend,
        send: requestSend,
        request: request,
    }
}
