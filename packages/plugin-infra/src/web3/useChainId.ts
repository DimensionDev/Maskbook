import { useChainDetailed } from '.'
import { usePluginWeb3StateContext } from './Context'

/**
 * Get the chain id which is using by the given (or default) wallet
 * It will always yield Mainnet in production mode
 */
export function useChainId(pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).chainId
}

/**
 * Returns true if chain id is available
 */
export function useChainIdValid(pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).chainIdValid
}

/**
 * Returns true if the current chain id is matched with the given one
 * @param chainId
 * @returns
 */
export function useChainIdMatched(pluginID?: string, chainId?: number) {
    const chainDetailed = useChainDetailed(pluginID)
    if (!chainId) return false
    return chainDetailed?.chainId === chainId
}
