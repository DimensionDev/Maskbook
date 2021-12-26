import { first } from 'lodash-es'
import { useWeb3StateContext } from '../context'

/**
 * Get the address of the default wallet
 */
export function useAccount() {
    const { account, wallets } = useWeb3StateContext()
    return process.env.architecture === 'app' ? first(wallets)?.address ?? '' : account
}
