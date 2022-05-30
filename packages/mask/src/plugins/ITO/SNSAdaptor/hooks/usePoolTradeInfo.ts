import { useAsyncRetry } from 'react-use'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { PluginITO_RPC } from '../../messages'

/**
 * Get all trading activities of a given trader on a specific pool.
 * @param pid
 * @param trader
 */
export function usePoolTradeInfo(pid: string, trader: string) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    return useAsyncRetry(async () => {
        if (!pid || !trader) return
        return PluginITO_RPC.getTradeInfo(pid, trader, chainId)
    }, [pid, trader, chainId])
}
