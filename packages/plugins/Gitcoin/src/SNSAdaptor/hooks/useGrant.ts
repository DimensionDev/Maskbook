import { useAsyncRetry } from 'react-use'
import { fetchGrant } from '../../apis/index.js'

export function useGrant(id: string) {
    return useAsyncRetry(() => fetchGrant(id))
}
