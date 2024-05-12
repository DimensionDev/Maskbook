import { EthereumMethodType, createJsonRpcPayload } from '@masknet/web3-shared-evm'
import { fetchJsonRpcResponse } from './fetchJsonRpcResponse.js'

export async function fetchChainId(url: string, init?: RequestInit) {
    const { result } = await fetchJsonRpcResponse(
        url,
        createJsonRpcPayload(0, {
            method: EthereumMethodType.eth_chainId,
            params: [],
        }),
        init,
    )
    return Number.parseInt(result, 16)
}
