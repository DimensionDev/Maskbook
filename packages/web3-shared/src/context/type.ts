import type { provider as Provider } from 'web3-core'
import type { Subscription } from 'use-subscription'
import type { ChainId, ERC20TokenDetailed, ERC721TokenDetailed, NetworkType, ProviderType, Wallet } from '../types'

export interface Web3ProviderType {
    provider: Subscription<Provider>
    allowTestChain: Subscription<boolean>
    account: Subscription<string>
    nonce: Subscription<number>
    gasPrice: Subscription<number>
    chainId: Subscription<ChainId>
    balance: Subscription<string>
    blockNumber: Subscription<number>
    wallets: Subscription<Wallet[]>
    providerType: Subscription<ProviderType>
    networkType: Subscription<NetworkType>
    erc20Tokens: Subscription<ERC20TokenDetailed[]>
    erc721Tokens: Subscription<ERC721TokenDetailed[]>
}
