import { useWeb3StateContext } from '.'

/**
 * Get the current block number
 */
export function useBalance() {
    return useWeb3StateContext().balance
}
