import { useAsync } from 'react-use'
import { PluginITO_RPC } from '../messages'

export function usePoolPayload(id: string) {
    return useAsync(() => PluginITO_RPC.getPool(id), [id])
}
