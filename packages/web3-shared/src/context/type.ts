import type { provider as Provider } from 'web3-core'
import type { Subscription } from 'use-subscription'
import type { ChainId, ERC20TokenDetailed, NetworkType, ProviderType, Wallet } from '../types'

export interface Web3ProviderType {
    provider: Subscription<Provider>
    allowTestChain: Subscription<boolean>
    account: Subscription<string>
    chainId: Subscription<ChainId>
    blockNumber: Subscription<number>
    wallets: Subscription<Wallet[]>
    providerType: Subscription<ProviderType>
    networkType: Subscription<NetworkType>
    erc20Tokens: Subscription<ERC20TokenDetailed[]>
}
