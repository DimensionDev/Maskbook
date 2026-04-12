import { createWalletClient, type Chain, custom, publicActions } from 'viem'
import { createJsonRpcRequest, ErrorEditor, type RequestArguments } from '@masknet/web3-shared-evm'
import { fetchJsonRpcResponse } from './fetchJsonRpcResponse.js'

export function createViemClient(chain: Chain | undefined, request: (arg: RequestArguments) => Promise<any>) {
    const client = createWalletClient({
        chain,
        transport: custom({ request }),
        pollingInterval: Number.MAX_SAFE_INTEGER,
    }).extend(publicActions)
    return client
}

export function createViemClientFromURL(url: string) {
    return createViemClient(undefined, async (requestArguments) => {
        const response = await fetchJsonRpcResponse(url, createJsonRpcRequest(0, requestArguments))
        const editor = ErrorEditor.from(null, response)
        if (editor.presence) throw editor.error
        if ('result' in response) return response.result
        return undefined
    })
}
