import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

export function useParamTab<T extends string>(defaultTab: T) {
    const [params, setParams] = useSearchParams()
    const tab = (params.get('tab') || defaultTab) as T
    const handleTabChange = useCallback(
        (_: unknown, tab: T) => {
            setParams(
                (params) => {
                    params.set('tab', tab)
                    return params.toString()
                },
                { replace: true },
            )
        },
        [setParams],
    )

    return [tab, handleTabChange] as const
}
