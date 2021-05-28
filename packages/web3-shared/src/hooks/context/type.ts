import type { ChainId, WalletProvider } from '../../types'
import type { Subscription } from 'use-subscription'
import type { Wallet } from '../useWallets'
import type { ERC20TokenDetailed } from '../useERC20Tokens'

export interface Web3ProviderType {
    allowTestChain: Subscription<boolean>
    currentChain: Subscription<ChainId>
    wallets: Subscription<Wallet[]>
    walletProvider: Subscription<WalletProvider>
    selectedWalletAddress: Subscription<string>
    erc20Tokens: Subscription<ERC20TokenDetailed[]>
    blockNumber: Subscription<number>
}
