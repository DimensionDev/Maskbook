import { createContext, useContext } from 'react'
import type { ChainId } from '../types'
import type { Subscription } from 'use-subscription'

export interface Web3Context {
    currentChain: Subscription<ChainId>
}

const Web3Context = createContext<Web3Context>(null!)
export function useWeb3Context() {
    const context = useContext(Web3Context)
    if (!context) throw new Error('This hook should be used in a provider')
    return context
}
export const Web3Provider = Web3Context.Provider
