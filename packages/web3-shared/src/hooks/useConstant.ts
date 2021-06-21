import { useMemo } from 'react'
import { ChainId, Web3Constants } from '../types'
import { constantOfChain } from '../utils/constant'
import { useChainId } from './useChainId'

/**
 * @deprecated Use useConstantNext from `@dimensiondev/web3-shared` package
 *
 * Before: `useConstant(T, "a")`
 *
 * After: `useConstantNext(T).a`
 */
export function useConstant<T extends Web3Constants, K extends keyof T>(constant: T, key: K, chainId?: ChainId) {
    const chainId_ = useChainId()
    return pick(constant, key, chainId ?? chainId_)
}

export function useConstantNext<T extends Web3Constants>(constants: T, chainId?: ChainId) {
    const current = useChainId()
    const finalChain = chainId ?? current
    return useMemo(() => constantOfChain(constants, finalChain), [constants, finalChain])
}

function pick<T extends Web3Constants, K extends keyof T>(
    constants: T,
    key: K,
    chainId = ChainId.Mainnet,
): T[K][ChainId.Mainnet] {
    return constants[key][chainId]
}
