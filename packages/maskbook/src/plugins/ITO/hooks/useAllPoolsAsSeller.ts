import { useAsyncRetry } from 'react-use'
import { PluginITO_RPC } from '../messages'

export function useAllPoolsAsSeller(address: string) {
    return useAsyncRetry(() => PluginITO_RPC.getAllPoolsAsSeller(address), [address])
}
