import { useAsyncRetry } from 'react-use'
import { PluginITO_RPC } from '../messages'

export function usePoolPayload(id: string) {
    return useAsyncRetry(() => PluginITO_RPC.getPool(id), [id])
}
