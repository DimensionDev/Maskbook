import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { getLatestTimestamps } from '../../helpers/blocks'
import { PluginTraderRPC } from '../../messages'

/**
 *
 * @param duration
 * @param size the max size of each subgraph request can be returned
 */
export function useLatestBlockNumbers(duration: number, size = 1000) {
    return useAsyncRetry(async () => {
        const timestamps = getLatestTimestamps(duration, size)
        return PluginTraderRPC.fetchBlockNumbersByTimestamps(timestamps)
    }, [])
}
