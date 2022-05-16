import { useAsyncRetry } from 'react-use'
import { PluginITO_RPC } from '../../messages'

/**
 * Get all trading activities of a given trader on a specific pool.
 * @param pid
 * @param trader
 */
export function usePoolTradeInfo(pid: string, trader: string) {
    return useAsyncRetry(async () => {
        if (!pid || !trader) return
        return PluginITO_RPC.getTradeInfo(pid, trader)
    }, [pid, trader])
}
