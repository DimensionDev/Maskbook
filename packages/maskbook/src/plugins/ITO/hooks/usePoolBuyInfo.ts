import { useAsyncRetry } from 'react-use'
import { PluginITO_RPC } from '../messages'

export function usePoolBuyInfo(pid: string, buyer: string) {
    return useAsyncRetry(() => PluginITO_RPC.getBuyInfo(pid, buyer), [pid])
}
