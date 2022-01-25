import type { NetworkPluginID } from '..'
import { usePluginWeb3StateContext } from './Context'

/**
 * Get the current block number
 */
export function useBalance(pluginID?: NetworkPluginID) {
    return usePluginWeb3StateContext(pluginID).balance
}
