import { useAsyncRetry } from 'react-use'
import { getPastTimestamps } from '../../helpers/blocks'
import { PluginTraderRPC } from '../../messages'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

/**
 * The latest block numbers (ethereum)
 * @param duration
 * @param size the max size of each subgraph request can be returned
 */
export function useLatestBlockNumbers(duration: number, size = 50) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    return useAsyncRetry(async () => {
        const timestamps = getPastTimestamps(duration, size)
        return PluginTraderRPC.fetchBlockNumbersByTimestamps(chainId, timestamps)
    }, [])
}
