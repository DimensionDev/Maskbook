import { useAsyncRetry } from 'react-use'
import { PluginITO_RPC } from '../messages'

export function usePoolTradeInfo(pid: string, trader: string) {
    return useAsyncRetry(() => PluginITO_RPC.getTradeInfo(pid, trader), [pid])
}
