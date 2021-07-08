import type { PastLogsOptions, Log } from 'web3-core'
import type { ChainId } from '../types'
import { getRPCConstants } from '../constants'

// Metamask RPC is not reliable for method 'eth_getLogs', since it is set casually by the user.
//  So we use our own default controllable RPC.
export async function getPastLogs(queryParam: PastLogsOptions, chainId: ChainId): Promise<Log[]> {
    const { RPC } = getRPCConstants(chainId)
    if (!RPC[0]) throw new Error('Unknown chain id.')
    const res = await fetch(RPC[0], {
        method: 'POST',
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getLogs',
            params: [queryParam],
            id: 1,
        }),
    })
    return (await res.json()).result as Log[]
}
