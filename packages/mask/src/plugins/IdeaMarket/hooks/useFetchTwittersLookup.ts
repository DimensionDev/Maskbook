import { useAsync } from 'react-use'
import type { IdeaToken } from '../types'
import { fetchTwitterLookup } from '../apis'

export function useFetchTwitterLookup(token: IdeaToken) {
    const { value, error, loading } = useAsync(async () => {
        return fetchTwitterLookup(token)
    }, [token])

    return { twitters: value, error, loading }
}
