import { useAsyncRetry } from 'react-use'
import { fetchPools } from '../apis'

export function useFetchPools() {
    return useAsyncRetry(() => fetchPools())
}
