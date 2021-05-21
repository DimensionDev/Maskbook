import { useSubscription } from 'use-subscription'
import { useWeb3Context } from './context'

/**
 * Get the chain id which is using by the given (or default) wallet
 * It will always yield Mainnet in production mode
 */
export function useChainId() {
    return useSubscription(useWeb3Context().currentChain)
}
export { ChainId } from '../types'
