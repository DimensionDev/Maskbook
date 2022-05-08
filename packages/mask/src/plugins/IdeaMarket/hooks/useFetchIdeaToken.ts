import { useAsync } from 'react-use'
import { PluginIdeaMarketRPC } from '../messages'

export function useFetchIdeaToken(marketName: string, tokenName: string) {
    return useAsync(async () => {
        if (!tokenName || !marketName) return
        return PluginIdeaMarketRPC.fetchIdeaToken(marketName, tokenName)
    }, [marketName, tokenName])
}
