import type { ChainId, ProviderType } from '../../types'
import type { Subscription } from 'use-subscription'
import type { Wallet } from '../useWallets'

export interface Web3ProviderType {
    allowTestChain: Subscription<boolean>
    currentChain: Subscription<ChainId>
    wallets: Subscription<Wallet[]>
    walletProvider: Subscription<ProviderType>
    selectedWalletAddress: Subscription<string>
}
