import type { ChainId } from '../types'
import { useWeb3StateContext } from '../context'
import { useChainDetailed } from './useChainDetailed'

/**
 * Get the chain id which is using by the given (or default) wallet
 * It will always yield Mainnet in production mode
 */
export function useChainId(): ChainId {
    const { chainId, maskWalletChainId } = useWeb3StateContext()

    if (location.pathname === '/popups.html') return maskWalletChainId
    return chainId
}

/**
 * Returns true if chain id is available
 */
export function useChainIdValid(): boolean {
    return useWeb3StateContext().chainIdValid
}

/**
 * Returns true if the current chain id is matched with the given one
 * @param chainId
 * @returns
 */
export function useChainIdMatched(chainId?: ChainId) {
    const chainDetailed = useChainDetailed()
    if (!chainId) return false
    return chainDetailed?.chainId === chainId
}

export const useChainIDAvailable = useChainId
