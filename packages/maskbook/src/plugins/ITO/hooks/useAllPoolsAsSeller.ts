import { useAsync } from 'react-use'
import { PluginITO_RPC } from '../messages'

export function useAllPoolsAsSeller(address: string) {
    return useAsync(() => PluginITO_RPC.getAllPoolsAsSeller(address), [address])
}
