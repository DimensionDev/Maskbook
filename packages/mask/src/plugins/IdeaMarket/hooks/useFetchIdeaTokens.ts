import { useAsync } from 'react-use'
import { fetchTwitterLookups } from '../apis'
import { PluginIdeaMarketRPC } from '../messages'

export function useFetchIdeaTokensBySearch(searchText: string, page: number, filters: string[]) {
    const { value, error, loading } = useAsync(async () => {
        const tokens = await PluginIdeaMarketRPC.fetchAllTokens(searchText, page, filters)

        const hasTwitterTokens = tokens.filter((token) => token.market.id === '0x1')
        if (hasTwitterTokens.length === 0) return tokens

        const ideaTokensWithTwitterLookups = await fetchTwitterLookups(tokens)

        return ideaTokensWithTwitterLookups
    }, [searchText, page, filters])

    return { tokens: value, error, loading }
}
