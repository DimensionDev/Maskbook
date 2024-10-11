import { useSearchParams } from 'react-router-dom'

export type TradeMode = 'swap' | 'bridge'

export function useMode() {
    const [params] = useSearchParams()
    const mode = (params.get('mode') as TradeMode) || 'swap'
    return mode
}
