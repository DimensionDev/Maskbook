import { useAsyncRetry } from 'react-use'
import { PluginTraderRPC } from '../messages'

export function usePoolTokens(address: string, duration: number, size: number) {
    return useAsyncRetry(async () => {
        if (!address) return []
        return PluginTraderRPC.fetchPoolTokens(address, duration, size)
    }, [address, duration, size])
}
