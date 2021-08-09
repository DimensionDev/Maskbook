import type { PastLogsOptions } from 'web3-core'
import { toHex } from 'web3-utils'

// There's a getPastLogs block range limitation which differ from RPCs.
//  So we need to split one large range request to multiple small ones.
export function useGetPastLogsParams(
    fromBlock: number | undefined,
    currentBlock: number,
    maxBlockRange: number,
    params: Partial<PastLogsOptions>,
) {
    if (!fromBlock || fromBlock > currentBlock) return []
    let count = 1
    const queryParams = []
    while (fromBlock + count * maxBlockRange < currentBlock) {
        queryParams.push({
            fromBlock: toHex(fromBlock + (count - 1) * maxBlockRange),
            toBlock: toHex(fromBlock + count * maxBlockRange),
            ...params,
        })
        count += 1
    }
    queryParams.push({
        fromBlock: toHex(fromBlock + (count - 1) * maxBlockRange),
        toBlock: toHex(currentBlock),
        ...params,
    })
    return queryParams
}
