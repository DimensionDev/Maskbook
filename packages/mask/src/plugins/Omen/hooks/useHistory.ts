import { useAsyncRetry } from 'react-use'
import { fetchHistory } from '../apis'

export function useFetchHistory(id: string) {
    return useAsyncRetry(async () => {
        if (!id) return null

        return fetchHistory(id)
    }, [id])
}
