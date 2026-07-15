import { memoize } from 'lodash-es'
import { createJsonRpcRequest, ErrorEditor, type Web3Provider } from '@masknet/web3-shared-evm'
import { createWeb3ProviderFromRequest } from './createWeb3ProviderFromRequest.js'
import { fetchJsonRpcResponse } from './fetchJsonRpcResponse.js'

function __create__(url: string) {
    return createWeb3ProviderFromRequest(async (requestArguments) => {
        const response = await fetchJsonRpcResponse(url, createJsonRpcRequest(0, requestArguments))
        const editor = ErrorEditor.from(null, response)
        if (editor.presence) throw editor.error
        if ('result' in response) return response.result
        return
    })
}

export const createWeb3ProviderFromURL: (url: string) => Web3Provider = memoize(__create__, (url) => url.toLowerCase())
