import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export function usePageTab<T extends string>(pageMap: Record<T, string>) {
    const navigate = useNavigate()
    const pathname = useLocation().pathname
    const currentTab = Object.keys(pageMap).find((key) => pageMap[key as T] === pathname) as T
    const handleTabChange = useCallback(
        (_: unknown, tab: T) => {
            navigate(pageMap[tab], { replace: true })
        },
        [pageMap],
    )

    return [currentTab, handleTabChange] as const
}
