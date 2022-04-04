import { useAsync } from 'react-use'
import { fetchAllTokens, fetchTwitterLookups } from '../apis'

export function useFetchIdeaTokensBySearch(searchText: string, page: number, filters: string[]) {
    const { value, error, loading } = useAsync(async () => {
        const tokens = await fetchAllTokens(searchText, page, filters)

        const hasTwitterTokens = tokens.filter((token) => token.market.id === '0x1')
        if (hasTwitterTokens.length === 0) return tokens

        const ideaTokensWithTwitterLookups = await fetchTwitterLookups(tokens)

        return ideaTokensWithTwitterLookups
    }, [searchText, page, filters])

    return { tokens: value, error, loading }
}
