import { useWeb3StateContext } from '../context'

/**
 * Get the current block number
 */
export function useBalance() {
    return useWeb3StateContext().balance
}
