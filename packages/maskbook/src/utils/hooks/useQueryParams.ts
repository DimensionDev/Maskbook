import { useHistory } from 'react-router-dom'

export function useQueryParams(query: string[]) {
    const history = useHistory<unknown>()
    const result: { [key: string]: string | null } = {}
    const search = new URLSearchParams(history.location.search)
    query.forEach((q) => (result[q] = search.get(q)))
    return result
}
