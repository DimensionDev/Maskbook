import { useAsync } from 'react-use'
import { fetchUserTokens } from '../apis'

export function useFetchUserTokens(holder: string) {
    return useAsync(async () => {
        if (!holder) return
        return fetchUserTokens(holder)
    }, [holder])
}
