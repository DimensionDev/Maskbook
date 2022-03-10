import { useAsyncRetry } from 'react-use'
import { fetchLiquidity } from '../apis'

export function useFetchLiquidity(id: string) {
    return useAsyncRetry(async () => {
        if (!id) return null

        return fetchLiquidity(id)
    }, [id])
}
