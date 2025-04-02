import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export type TabPathPair = [tab: string, ...paths: string[]]
export function usePathTab(pairs: TabPathPair[], keepSearch = false) {
    const navigate = useNavigate()
    const location = useLocation()
    const { pathname, search } = location
    const firstPair = pairs[0]
    const tab = pairs.find(([, ...paths]) => paths.includes(pathname))?.[0] || firstPair[0]

    const handleTabChange = useCallback(
        (_: unknown, tab: string) => {
            const pair = pairs.find((pair) => pair[0] === tab) || firstPair
            navigate(keepSearch ? `${pair[1]}${search}` : pair[1], { replace: true })
        },
        [navigate, keepSearch, search],
    )

    return [tab, handleTabChange] as const
}
