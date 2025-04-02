import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

// TODO: will rename to useSearchParamsTab
export function useParamTab<T extends string>(defaultTab: T, paramKey = 'tab') {
    const [params, setParams] = useSearchParams()
    const tab = (params.get(paramKey) || defaultTab) as T
    const handleTabChange = useCallback(
        (_: unknown, tab: T) => {
            setParams(
                (params) => {
                    params.set(paramKey, tab)
                    return params.toString()
                },
                { replace: true },
            )
        },
        [setParams, paramKey],
    )

    return [tab, handleTabChange] as const
}
