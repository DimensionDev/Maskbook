import { useWeb3Context } from '../context'

/**
 * Get the address of the default wallet
 */
export function useAccount() {
    return useWeb3Context().account
}
