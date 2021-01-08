import { useAsyncRetry } from 'react-use'
import { PluginITO_RPC } from '../messages'

export function useAllPoolsAsSeller(address: string) {
    return useAsyncRetry(async () => {
        const pools = await PluginITO_RPC.getAllPoolsAsSeller('0x0d09dc9a840b1b4ea25194998fd90bb50fc2008a')
        return pools.reverse()
    }, [address])
}
