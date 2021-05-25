import { ChainId } from '..'
import { useWeb3Provider } from './provider'
import { useSubscription } from 'use-subscription'
import type { Wallet } from '../useWallets'

/** @internal */
export function useSharedStatesRaw() {
    const context = useWeb3Provider()

    const wallets = useSubscription(context.wallets)
    const selectedAddress = useSubscription(context.selectedWalletAddress)
    const chainID = useChainID()
    const isChainIDAvailable = useChainIDAvailable(wallets)
    return {
        chainID,
        isChainIDAvailable,
        wallets,
        selectedAddress,
    }
}

/** @internal */
function useChainID(): ChainId {
    const _ = useWeb3Provider()
    const allowTestChain = useSubscription(_.allowTestChain)
    const chain = useSubscription(_.currentChain)
    if (!allowTestChain) return ChainId.Mainnet
    return chain
}
/** @internal */
function useChainIDAvailable(wallets: Wallet[]): boolean {
    const _ = useWeb3Provider()
    const allowTestChain = useSubscription(_.allowTestChain)
    const unsafeChainId = useSubscription(_.currentChain)
    const selectedWallet = wallets
    return allowTestChain || unsafeChainId === ChainId.Mainnet || !selectedWallet
}
