import { useAsyncRetry } from 'react-use'
import { PluginITO_RPC } from '../../messages'

export function useAllPoolsAsBuyer(address: string) {
    return useAsyncRetry(() => PluginITO_RPC.getAllPoolsAsBuyer(address), [address])
}
