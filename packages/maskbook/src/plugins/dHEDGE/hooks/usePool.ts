import { useAsyncRetry } from 'react-use'
import { PluginDHedgeRPC } from '../messages'

export function usePool(id: string) {
    return useAsyncRetry(() => PluginDHedgeRPC.fetchPool(id))
}
