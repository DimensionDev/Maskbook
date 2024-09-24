import { useCallback, type Dispatch, type SetStateAction } from 'react'
import { useSearchParams } from 'react-router-dom'

export type TradeMode = 'swap' | 'bridge'

export function useMode() {
    const [params, setParams] = useSearchParams()
    const mode = (params.get('mode') as TradeMode) || 'swap'
    const setMode: Dispatch<SetStateAction<TradeMode>> = useCallback(
        (mode) => {
            setParams((p) => {
                p.set('mode', typeof mode === 'function' ? mode(p.get('mode') as TradeMode) : mode)
                return p.toString()
            })
        },
        [setParams],
    )
    return [mode, setMode] as const
}
