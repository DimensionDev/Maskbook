import type { ChainId } from '../types'
import { useWeb3StateContext } from '../context'

/**
 * Get the chain id which is using by the given (or default) wallet
 * It will always yield Mainnet in production mode
 */
export function useChainId(): ChainId {
    return useWeb3StateContext().chainId
}

export const useChainIDAvailable = useChainId
