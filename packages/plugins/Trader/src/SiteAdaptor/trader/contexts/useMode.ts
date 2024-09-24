import { useCallback } from 'react'
import { useSearchParams, type NavigateOptions } from 'react-router-dom'

export type TradeMode = 'swap' | 'bridge'

export function useMode() {
    const [params, setParams] = useSearchParams()
    const mode = (params.get('mode') as TradeMode) || 'swap'
    const setMode = useCallback(
        (mode: TradeMode, options?: NavigateOptions) => {
            setParams((p) => {
                p.set('mode', mode)
                return p.toString()
            }, options)
        },
        [setParams],
    )
    return [mode, setMode] as const
}
