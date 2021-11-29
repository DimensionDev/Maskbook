import type { NetworkPluginID } from '..'
import { usePluginWeb3StateContext } from './Context'

/**
 * Get the chain id which is using by the given (or default) wallet
 * It will always yield Mainnet in production mode
 */
export function useChainId(pluginID?: NetworkPluginID) {
    return usePluginWeb3StateContext(pluginID).chainId
}
