import { useAsync } from 'react-use'
import { fetchAllTokens } from '../apis'

export function useFetchIdeaTokens() {
    return useAsync(async () => {
        return fetchAllTokens()
    }, [])
}
