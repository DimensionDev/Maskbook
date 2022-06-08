import { useAsync } from 'react-use'
import { fetchTwitterLookups } from '../apis'
import { PluginIdeaMarketRPC } from '../messages'
import { Markets } from '../types'

export function useFetchIdeaTokensBySearch(searchText: string, page: number, filters: string[]) {
    const { value, error, loading } = useAsync(async () => {
        const tokens = await PluginIdeaMarketRPC.fetchAllTokens(searchText, page, filters)

        const hasTwitterTokens = tokens.filter((token) => token.market.marketID === Markets.Twitter)
        if (hasTwitterTokens.length === 0) return tokens

        const ideaTokensWithTwitterLookups = await fetchTwitterLookups(tokens)

        return ideaTokensWithTwitterLookups
    }, [searchText, page, filters])

    return { tokens: value, error, loading }
}
