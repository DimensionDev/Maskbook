import { useHistory } from 'react-router-dom'

export function useQueryParams<K extends readonly string[]>(query: K) {
    const history = useHistory<unknown>()
    const result: Record<string, string | null> = {} as any
    const search = new URLSearchParams(history.location.search)
    query.forEach((q) => (result[q] = search.get(q)))
    return result as { [key in K[number]]: string | null }
}
