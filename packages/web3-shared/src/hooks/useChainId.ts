import { useSubscription } from 'use-subscription'
import { useWallet } from '.'
import { ChainId } from '../types'
import { useWeb3Context } from './context'

/**
 * Get the chain id which is using by the given (or default) wallet
 * It will always yield Mainnet in production mode
 */
export function useChainId() {
    const _ = useWeb3Context()
    const allowTestChain = useSubscription(_.allowTestChain)
    const chain = useSubscription(_.currentChain)
    if (!allowTestChain) return ChainId.Mainnet
    return chain
}
export { ChainId } from '../types'
/**
 * Retruns true if chain id is available
 */
export function useChainIdValid() {
    const _ = useWeb3Context()
    const allowTestChain = useSubscription(_.allowTestChain)
    const unsafeChainId = useSubscription(_.currentChain)
    const selectedWallet = useWallet()
    return allowTestChain || unsafeChainId === ChainId.Mainnet || !selectedWallet
}
