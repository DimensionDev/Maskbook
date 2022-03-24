import { useAsync } from 'react-use'
import { PluginIdeaMarketRPC } from '../messages'

export function useFetchIdeaTokensBySearch(searchText: string) {
    const { value, error, loading } = useAsync(async () => {
        return PluginIdeaMarketRPC.fetchAllTokens(searchText)
    }, [searchText])

    return { tokens: value?.ideaTokens, error, loading }
}
