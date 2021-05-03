import { useAsyncRetry } from 'react-use'
import { PluginDHedgeRPC } from '../messages'

export function usePool(address: string) {
    return useAsyncRetry(() => PluginDHedgeRPC.fetchPool(address))
}
