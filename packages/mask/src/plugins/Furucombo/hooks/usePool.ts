import { useAsyncRetry } from 'react-use'
import { fetchPools } from '../apis/index.js'

export function useFetchPools() {
    return useAsyncRetry(() => fetchPools())
}
