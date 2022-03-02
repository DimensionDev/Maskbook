import { useAsync } from 'react-use'
import { fetchUserTokensBalances } from '../apis'

export function useFetchUserTokens(holder: string) {
    return useAsync(async () => {
        if (!holder) return
        return fetchUserTokensBalances(holder)
    }, [holder])
}
