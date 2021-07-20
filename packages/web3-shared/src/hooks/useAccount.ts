import { useWeb3StateContext } from '../context'

/**
 * Get the address of the default wallet
 */
export function useAccount() {
    return useWeb3StateContext().account
}
