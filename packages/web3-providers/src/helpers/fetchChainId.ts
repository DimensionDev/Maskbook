import { EthereumMethodType, createJsonRpcRequest } from '@masknet/web3-shared-evm'
import { fetchJsonRpcResponse } from './fetchJsonRpcResponse.js'

export async function fetchChainId(url: string, init?: RequestInit) {
    const response = await fetchJsonRpcResponse(
        url,
        createJsonRpcRequest(0, {
            method: EthereumMethodType.eth_chainId,
            params: [],
        }),
        init,
    )
    if ('result' in response && typeof response.result === 'string') {
        return Number.parseInt(response.result, 16)
    }
    throw new Error('Failed to fetch chain ID')
}
