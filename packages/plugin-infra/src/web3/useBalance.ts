import { usePluginWeb3StateContext } from '../context'

/**
 * Get the current block number
 */
export function useBalance(pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).balance
}
