import { useMemo } from 'react'
import { CONSTANTS, getConstant, getAllConstants } from '../constants'
import { useChainId } from './useChainId'
import type { ChainId } from '../types'

export function useConstant<T extends keyof typeof CONSTANTS>(key: T, chainId?: ChainId) {
    const chainId_ = useChainId()
    const id = chainId ?? chainId_
    return useMemo(() => getConstant(key, id), [id])
}

export function useAllConstants(chainId?: ChainId) {
    const chainId_ = useChainId()
    const id = chainId ?? chainId_
    return useMemo(() => getAllConstants(id), [id])
}
