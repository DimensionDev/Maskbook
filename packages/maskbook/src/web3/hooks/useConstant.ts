import { useChainId } from './useChainId'
import type { ChainId } from '../types'
import { getConstant, Web3Constants } from '../helpers'

export function useConstant<T extends Web3Constants, K extends keyof T>(constant: T, key: K, chainId?: ChainId) {
    const chainId_ = useChainId()
    return getConstant(constant, key, chainId ?? chainId_)
}
