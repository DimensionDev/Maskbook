import { useAsyncRetry } from 'react-use'
import { PluginDHedgeRPC } from '../messages'
import { useApiURL } from './useUrl'
import type { Period } from '../types'

export function useFetchPool(address: string) {
    const API_URL = useApiURL()
    return useAsyncRetry(async () => {
        if (!API_URL) return
        return PluginDHedgeRPC.fetchPool(address, API_URL)
    }, [address])
}

export function useFetchPoolHistory(address: string, period: Period, sort = true) {
    const API_URL = useApiURL()
    return useAsyncRetry(async () => {
        if (!API_URL) return
        return PluginDHedgeRPC.fetchPoolPerformance(address, period, API_URL, sort)
    }, [address, period, sort])
}
