import { useAsyncRetry } from 'react-use'
import { fetchGrant } from '../apis'

export function useGrant(id: string) {
    return useAsyncRetry(() => fetchGrant(id))
}
