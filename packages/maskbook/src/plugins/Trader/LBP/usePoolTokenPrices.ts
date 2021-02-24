import { useAsyncRetry } from 'react-use'
import { PluginTraderRPC } from '../messages'

export function usePoolTokenPrices(address: string, duration: number, size = 50) {
    return useAsyncRetry(async () => {
        if (!address) return []
        return PluginTraderRPC.fetchTokenPrices(address, duration, size)
    }, [address, duration, size])
}
