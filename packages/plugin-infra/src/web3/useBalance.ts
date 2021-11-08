import { usePluginWeb3StateContext } from '../context'

/**
 * Get the current block number
 */
export function useBalance() {
    return usePluginWeb3StateContext().balance
}
