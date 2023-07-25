import { createJsonRpcPayload, ErrorEditor, type Web3Provider } from '@masknet/web3-shared-evm'
import { createWeb3ProviderFromRequest } from './createWeb3ProviderFromRequest.js'
import { fetchJsonRpcResponse } from './fetchJsonRpcResponse.js'

export function createWeb3ProviderFromURL(url: string): Web3Provider {
    return createWeb3ProviderFromRequest(async (requestArguments) => {
        const response = await fetchJsonRpcResponse(url, createJsonRpcPayload(0, requestArguments))
        const editor = ErrorEditor.from(null, response)
        if (editor.presence) throw editor.error
        return response.result
    })
}
