import { useAsyncRetry } from 'react-use'
import { PluginDHedgeRPC } from '../messages'
import { useDHedgeApiURL } from './useDHedge'
import type { Period } from '../types'

export function usePool(address: string) {
    const DHEDGE_API_URL = useDHedgeApiURL()
    return useAsyncRetry(() => PluginDHedgeRPC.fetchPool(address, DHEDGE_API_URL), [address])
}

export function usePoolHistory(address: string, period: Period) {
    const DHEDGE_API_URL = useDHedgeApiURL()
    return useAsyncRetry(() => PluginDHedgeRPC.fetchPoolPerformance(address, period, DHEDGE_API_URL), [address, period])
}
