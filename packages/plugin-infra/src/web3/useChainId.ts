import { useChainDetailed } from '.'
import { usePluginWeb3StateContext } from '../context'

/**
 * Get the chain id which is using by the given (or default) wallet
 * It will always yield Mainnet in production mode
 */
export function useChainId() {
    return usePluginWeb3StateContext().chainId
}

/**
 * Returns true if chain id is available
 */
export function useChainIdValid() {
    return usePluginWeb3StateContext().chainIdValid
}

/**
 * Returns true if the current chain id is matched with the given one
 * @param chainId
 * @returns
 */
export function useChainIdMatched(chainId?: number) {
    const chainDetailed = useChainDetailed()
    if (!chainId) return false
    return chainDetailed?.chainId === chainId
}
