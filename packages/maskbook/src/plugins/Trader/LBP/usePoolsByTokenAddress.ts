import { useAsyncRetry } from 'react-use'
import { PluginTraderRPC } from '../messages'

export function usePoolsByTokenAddress(address: string) {
    return useAsyncRetry(async () => {
        return PluginTraderRPC.fetchPoolsByTokenAddress(address)
    }, [address])
}
