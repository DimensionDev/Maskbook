import { useMemo } from 'react'
import { useChainId } from './useChainId'
import type { ChainId } from '../types'
import { getConstant, getAllConstants, Web3Constants } from '../helpers'

export function useConstant<T extends Web3Constants, K extends keyof T>(constant: T, key: K, chainId?: ChainId) {
    const chainId_ = useChainId()
    const id = chainId ?? chainId_
    return useMemo(() => getConstant(constant, key, id), [id])
}

export function useAllConstants<T extends Web3Constants>(constant: T, chainId?: ChainId) {
    const chainId_ = useChainId()
    const id = chainId ?? chainId_
    return useMemo(() => getAllConstants(constant, id), [id])
}
