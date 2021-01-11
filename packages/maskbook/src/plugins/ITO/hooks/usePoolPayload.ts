import { useAsyncRetry } from 'react-use'
import { PluginITO_RPC } from '../messages'

export function usePoolPayload(pid: string) {
    return useAsyncRetry(() => PluginITO_RPC.getPool(pid), [pid])
}
