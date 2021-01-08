import { useAsyncRetry } from 'react-use'
import { PluginITO_RPC } from '../messages'

export function useAllPoolsAsSeller(address: string) {
    return useAsyncRetry(async () => {
        const pools = await PluginITO_RPC.getAllPoolsAsSeller(address)
        return pools.reverse()
    }, [address])
}
