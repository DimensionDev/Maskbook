import { useLocation } from 'react-router-dom'
export function useQueryParams(query: string[]) {
    const location = useLocation()
    const result: { [key: string]: string | null } = {}
    const search = new URLSearchParams(location.search)
    query.forEach((q) => (result[q] = search.get(q)))
    return result
}
