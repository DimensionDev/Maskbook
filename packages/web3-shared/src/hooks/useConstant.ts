import { useMemo } from 'react'
import type { ChainId, Web3Constants } from '../types'
import { constantOfChain } from '../utils'
import { useChainId } from './useChainId'

export function useConstant<T extends Web3Constants>(constants: T, chainId?: ChainId) {
    const current = useChainId()
    const finalChain = chainId ?? current
    return useMemo(() => constantOfChain(constants, finalChain), [constants, finalChain])
}
