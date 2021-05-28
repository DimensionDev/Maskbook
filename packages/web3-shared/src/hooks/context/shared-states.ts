import { ChainId } from '..'
import { useWeb3Provider } from './provider'
import { useSubscription } from 'use-subscription'
import type { Wallet } from '../useWallets'
import { isSameAddress } from '../../utils'

/** @internal */
export function useSharedStatesRaw() {
    const context = useWeb3Provider()

    const wallets = useSubscription(context.wallets)
    const erc20Tokens = useSubscription(context.erc20Tokens)
    const selectedAddress = useSubscription(context.selectedWalletAddress)
    const blockNumber = useSubscription(context.blockNumber)
    const chainID = useChainID()
    const isChainIDAvailable = useChainIDAvailable(wallets, selectedAddress)
    return {
        chainID,
        isChainIDAvailable,
        wallets,
        selectedAddress,
        erc20Tokens,
        blockNumber,
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
function useChainIDAvailable(wallets: Wallet[], selectedAddress: string): boolean {
    const _ = useWeb3Provider()
    const allowTestChain = useSubscription(_.allowTestChain)
    const unsafeChainId = useSubscription(_.currentChain)
    const selectedWallet = wallets.find((x) => isSameAddress(x.address, selectedAddress))
    return allowTestChain || unsafeChainId === ChainId.Mainnet || !selectedWallet
}
