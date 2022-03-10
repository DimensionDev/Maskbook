import { useAsyncRetry } from 'react-use'
import { fetchMarket } from '../apis'

export function useFetchMarket(id: string) {
    return useAsyncRetry(async () => {
        if (!id) return null

        return fetchMarket(id)
    }, [id])
}
