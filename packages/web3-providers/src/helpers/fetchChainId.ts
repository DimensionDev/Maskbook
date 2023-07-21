import type { JsonRpcResponse } from 'web3-core-helpers'
import { EthereumMethodType, createJsonRpcPayload } from '@masknet/web3-shared-evm'
import { fetchJSON } from './fetchJSON.js'

export async function fetchChainId(rpc: string) {
    const { result } = await fetchJSON<JsonRpcResponse>(rpc, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(
            createJsonRpcPayload(0, {
                method: EthereumMethodType.ETH_CHAIN_ID,
                params: [],
            }),
        ),
    })
    return Number.parseInt(result, 16)
}
