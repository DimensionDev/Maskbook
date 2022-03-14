import { useMemo } from 'react'
import { createNativeToken } from '../utils'
import { useChainId } from './useChainId'
import type { ChainId } from '../types'

export function useNativeTokenDetailed(chainId?: ChainId) {
    const currentChainId = useChainId()
    return useMemo(() => createNativeToken(chainId ?? currentChainId), [currentChainId, chainId])
}
