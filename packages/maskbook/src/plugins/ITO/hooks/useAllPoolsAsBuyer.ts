import { useAsync } from 'react-use'
import { PluginITO_RPC } from '../messages'

export function useAllPoolsAsBuyer(address: string) {
    return useAsync(() => PluginITO_RPC.getAllPoolsAsBuyer(address), [address])
}
