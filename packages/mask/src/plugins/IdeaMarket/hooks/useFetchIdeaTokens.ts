import { useAsync } from 'react-use'
import { fetchAllTokens } from '../apis'

export function useFetchIdeaTokensBySearch(searchText: string, page: number, filters: string[]) {
    const { value, error, loading } = useAsync(async () => {
        return fetchAllTokens(searchText, page, filters)
    }, [searchText, page])

    console.log(value)

    return { tokens: value, error, loading }
}
