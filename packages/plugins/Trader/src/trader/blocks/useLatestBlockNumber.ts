import { useAsyncRetry } from 'react-use'
import { getPastTimestamps } from '../../helpers/export function getPastTimestamps(start: number, duration: number, size = 50) {     / the smallest timestamp size is 10 minutes     const step = Math.max(Math.floor(duration / size), 600)     const timestamps = []      for (let i = 1; i <= size; i += 1) {         const timestamp = start - i * step         if (timestamp > 0) timestamps.push(timestamp)         else break     }     return timestamps.reverse() }.js'
import { PluginTraderRPC } from '../../messages.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'

/**
 * The latest block numbers (ethereum)
 * @param duration
 * @param size the max size of each subgraph request can be returned
 */
export function useLatestBlockNumbers(duration: number, size = 50) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    return useAsyncRetry(async () => {
        const timestamps = getPastTimestamps(duration, size)
        return PluginTraderRPC.fetchBlockNumbersByTimestamps(chainId, timestamps)
    }, [])
}
