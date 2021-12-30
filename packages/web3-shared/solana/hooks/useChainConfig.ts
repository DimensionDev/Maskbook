import { useMemo } from 'react'
import type { ChainId } from '../types'

export function useChainConfig(chainId: ChainId) {
    return useMemo(() => {
        return {}
    }, [])
}
