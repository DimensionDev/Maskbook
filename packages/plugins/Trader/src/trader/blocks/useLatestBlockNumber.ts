import { useAsyncRetry } from 'react-use'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { getPastTimestamps } from '../../helpers/getPastTimestamps.js'
import { PluginTraderRPC } from '../../messages.js'

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
