import { useMemo } from 'react'
import { CONSTANTS, getConstant, getAllConstants } from '../constants'
import { useChainId } from './useChainId'
import type { ChainId } from '../types'

export function useConstant<T extends keyof typeof CONSTANTS>(key: T, chainId?: ChainId) {
    const chainId_ = useChainId()
    return useMemo(() => getConstant(key, chainId ?? chainId_), [chainId ?? chainId_])
}

export function useAllConstants(chainId?: ChainId) {
    const chainId_ = useChainId()
    return useMemo(() => getAllConstants(chainId ?? chainId_), [chainId ?? chainId_])
}
