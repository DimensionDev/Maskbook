import { createContext, useContext } from 'react'
import type { ChainId, WalletProvider } from '../types'
import type { Subscription } from 'use-subscription'
import type { Wallet } from './useWallets'

export interface Web3Context {
    allowTestChain: Subscription<boolean>
    currentChain: Subscription<ChainId>
    wallets: Subscription<Wallet[]>
    walletProvider: Subscription<WalletProvider>
    selectedWalletAddress: Subscription<string>
}

const Web3Context = createContext<Web3Context>(null!)
export function useWeb3Context() {
    const context = useContext(Web3Context)
    if (!context) throw new Error('This hook should be used in a provider')
    return context
}
export const Web3Provider = Web3Context.Provider
