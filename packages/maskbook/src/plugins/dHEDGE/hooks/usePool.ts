import { useAsyncRetry } from 'react-use'
import { PluginDHedgeRPC } from '../messages'
import { useDHedgeApiURL } from './useDHedge'

export function usePool(address: string) {
    const DHEDGE_API_URL = useDHedgeApiURL()
    return useAsyncRetry(() => PluginDHedgeRPC.fetchPool(address, DHEDGE_API_URL))
}
