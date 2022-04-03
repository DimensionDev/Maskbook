import { useAsync } from 'react-use'
import { fetchAllTokens } from '../apis'

export function useFetchIdeaTokensBySearch(searchText: string, page: number, filters: number[]) {
    const { value, error, loading } = useAsync(async () => {
        return fetchAllTokens(searchText, page, filters)
    }, [searchText, page, filters])

    return { tokens: value, error, loading }
}
