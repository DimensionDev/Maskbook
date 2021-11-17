import type { provider as Provider } from 'web3-core'
import type { Subscription } from 'use-subscription'
import type {
    ChainId,
    ERC20TokenDetailed,
    ERC721TokenDetailed,
    ERC1155TokenDetailed,
    NonFungibleTokenDetailed,
    NetworkType,
    ProviderType,
    Wallet,
    PortfolioProvider,
    Asset,
    CollectibleProvider,
    Transaction,
    AddressName,
    AddressNameType,
    CryptoPrice,
    ERC721TokenCollectionInfo,
} from '../types'

export interface Web3ProviderType {
    provider: Subscription<Provider>
    allowTestnet: Subscription<boolean>
    account: Subscription<string>
    tokenPrices: Subscription<CryptoPrice>
    chainId: Subscription<ChainId>
    balance: Subscription<string>
    blockNumber: Subscription<number>
    walletPrimary: Subscription<Wallet | null>
    wallets: Subscription<Wallet[]>
    providerType: Subscription<ProviderType>
    networkType: Subscription<NetworkType>
    erc20Tokens: Subscription<ERC20TokenDetailed[]>
    erc721Tokens: Subscription<ERC721TokenDetailed[]>
    erc1155Tokens: Subscription<ERC1155TokenDetailed[]>
    portfolioProvider: Subscription<PortfolioProvider>

    addToken: (token: ERC20TokenDetailed | NonFungibleTokenDetailed) => Promise<void>
    removeToken: (token: ERC20TokenDetailed | NonFungibleTokenDetailed) => Promise<void>
    trustToken: (address: string, token: ERC20TokenDetailed | NonFungibleTokenDetailed) => Promise<void>
    blockToken: (address: string, token: ERC20TokenDetailed | NonFungibleTokenDetailed) => Promise<void>

    getAssetsList: (address: string, provider: PortfolioProvider, network?: NetworkType) => Promise<Asset[]>
    getAssetsListNFT: (
        address: string,
        chainId: ChainId,
        provider: CollectibleProvider,
        page?: number,
        size?: number,
        collection?: string,
    ) => Promise<{ assets: ERC721TokenDetailed[]; hasNextPage: boolean }>
    getCollectionsNFT: (
        address: string,
        chainId: ChainId,
        provider: CollectibleProvider,
        page?: number,
        size?: number,
    ) => Promise<{ collections: ERC721TokenCollectionInfo[]; hasNextPage: boolean }>
    getAddressNamesList: (twitterId: string, addressNameType: AddressNameType) => Promise<AddressName[]>
    getTransactionList: (
        address: string,
        network: NetworkType,
        provider: PortfolioProvider,
        page?: number,
        size?: number,
    ) => Promise<{
        transactions: Transaction[]
        hasNextPage: boolean
    }>
    fetchERC20TokensFromTokenLists: (urls: string[], chainId: ChainId) => Promise<ERC20TokenDetailed[]>
    createMnemonicWords: () => Promise<string[]>
}
