import { useAsync } from 'react-use'
import { fetchIdeaToken } from '../apis'

export function useFetchIdeaToken(marketName: string, tokenName: string) {
    return useAsync(async () => {
        if (!tokenName || !marketName) return
        return fetchIdeaToken(marketName, tokenName)
    }, [marketName, tokenName])
}
