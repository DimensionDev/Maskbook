import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { getLatestTimestamps } from '../../helpers/blocks'
import { PluginTraderRPC } from '../../messages'

/**
 * The latest block numbers (ethereum)
 * @param duration
 * @param size the max size of each subgraph request can be returned
 */
export function useLatestBlockNumbers(duration: number, size = 50) {
    return useAsyncRetry(async () => {
        const timestamps = getLatestTimestamps(duration, size)
        return PluginTraderRPC.fetchBlockNumbersByTimestamps(timestamps)
    }, [])
}
