import type { ChainId } from '../types'
import { useWeb3StateContext } from '../context'

/**
 * Get the chain id which is using by the given (or default) wallet
 * It will always yield Mainnet in production mode
 */
export function useChainId(): ChainId {
    return useWeb3StateContext().chainId
}

/**
 * Retruns true if chain id is available
 */
export function useChainIdValid(): boolean {
    return useWeb3StateContext().chainIdValid
}

export const useChainIDAvailable = useChainId
