import { useAsyncRetry } from 'react-use'
import { PluginTraderRPC } from '../messages'

export function usePools(address: string) {
    return useAsyncRetry(async () => {
        if (!address) return []
        return PluginTraderRPC.fetchLBP_PoolsByTokenAddress(address)
    }, [address])
}
