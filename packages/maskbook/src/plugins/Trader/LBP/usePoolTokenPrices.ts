import { useAsyncRetry } from 'react-use'
import { PluginTraderRPC } from '../messages'

export function usePoolTokenPrices(poolId: string, address: string, blockNumbers: number[]) {
    return useAsyncRetry(async () => {
        if (!poolId || !address || !blockNumbers.length) return
        return PluginTraderRPC.fetchPoolTokenPrices(poolId, address, blockNumbers)
    }, [poolId, address, blockNumbers[0]])
}
