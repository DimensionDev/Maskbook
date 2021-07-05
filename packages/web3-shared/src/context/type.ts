import type { provider as Provider } from 'web3-core'
import type { Subscription } from 'use-subscription'
import type {
    ChainId,
    ERC20TokenDetailed,
    NetworkType,
    ProviderType,
    Wallet,
    PortfolioProvider,
    Asset,
    ERC721TokenAssetDetailed,
    ERC1155TokenAssetDetailed,
    CollectibleProvider,
} from '../types'

export interface Web3ProviderType {
    provider: Subscription<Provider>
    allowTestnet: Subscription<boolean>
    account: Subscription<string>
    nonce: Subscription<number>
    gasPrice: Subscription<number>
    chainId: Subscription<ChainId>
    balance: Subscription<string>
    blockNumber: Subscription<number>
    wallets: Subscription<Wallet[]>
    providerType: Subscription<ProviderType>
    networkType: Subscription<NetworkType>
    erc20TokensCount: Subscription<number>
    erc20Tokens: Subscription<ERC20TokenDetailed[]>
    getERC20TokensPaged: (index: number, count: number, query?: string) => Promise<ERC20TokenDetailed[]>
    portfolioProvider: Subscription<PortfolioProvider>
    getAssetList: (address: string, provider: PortfolioProvider) => Promise<Asset[]>
    getAssetsListNFT: (
        address: string,
        chainId: ChainId,
        provider: CollectibleProvider,
        page?: number,
        size?: number,
    ) => Promise<{ assets: (ERC721TokenAssetDetailed | ERC1155TokenAssetDetailed)[]; hasNextPage: boolean }>
    getERC721TokensPaged: (index: number, count: number, query?: string) => Promise<ERC721TokenAssetDetailed[]>
    fetchERC20TokensFromTokenLists: (urls: string[], chainId: ChainId) => Promise<ERC20TokenDetailed[]>
    createMnemonicWords: () => Promise<string[]>
}
