import type { ChainId } from '../types'
import { useWeb3Context } from './context'

/**
 * Get the chain id which is using by the given (or default) wallet
 * It will always yield Mainnet in production mode
 */
export function useChainId(): ChainId {
    return useWeb3Context().chainID
}
export { ChainId } from '../types'
/**
 * Retruns true if chain id is available
 */
export function useChainIdValid(): boolean {
    return useWeb3Context().isChainIDAvailable
}
export const useChainIDAvailable = useChainId
