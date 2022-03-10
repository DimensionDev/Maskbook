import { useAsyncRetry } from 'react-use'
import { fetchToken } from '../apis'

export function useFetchToken(id: string) {
    return useAsyncRetry(async () => {
        if (!id) return null

        return fetchToken(id)
    }, [id])
}
