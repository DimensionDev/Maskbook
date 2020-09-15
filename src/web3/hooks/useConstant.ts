import { useMemo } from 'react'
import { ChainId } from '../types'
import { CONSTANTS, getConstant, getAllConstants } from '../constants'

export function useConstant(key: keyof typeof CONSTANTS, chainId: ChainId = ChainId.Mainnet) {
    return useMemo(() => getConstant(key, chainId), [chainId])
}

export function useAllConstants(chainId: ChainId = ChainId.Mainnet) {
    return useMemo(() => getAllConstants(chainId), [chainId])
}
