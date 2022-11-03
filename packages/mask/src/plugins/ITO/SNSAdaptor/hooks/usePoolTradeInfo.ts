import { useAsyncRetry } from 'react-use'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { PluginITO_RPC } from '../../messages.js'

/**
 * Get all trading activities of a given trader on a specific pool.
 * @param pid
 * @param trader
 */
export function usePoolTradeInfo(pid: string, trader: string) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    return useAsyncRetry(async () => {
        if (!pid || !trader) return
        return PluginITO_RPC.getTradeInfo(pid, trader, chainId)
    }, [pid, trader, chainId])
}
