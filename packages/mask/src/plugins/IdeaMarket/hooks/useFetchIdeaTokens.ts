import { escapeRegExp } from 'lodash-unified'
import { useAsync } from 'react-use'
import { fetchAllTokens } from '../apis'

export function useFetchIdeaTokensBySearch(searchText: string) {
    const searchRegex = new RegExp(escapeRegExp(searchText), 'i')

    const { value, error, loading } = useAsync(async () => {
        return fetchAllTokens(searchText)
    }, [searchText])

    return { tokens: value?.ideaTokens, error, loading }
}
