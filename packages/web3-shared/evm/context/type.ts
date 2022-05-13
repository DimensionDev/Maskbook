import type { RequestArguments } from 'web3-core'
import type { Subscription } from '@masknet/shared-base'
import type {
    ChainId,
    ERC20TokenDetailed,
    ERC721TokenDetailed,
    ERC1155TokenDetailed,
    NonFungibleTokenDetailed,
    NetworkType,
    ProviderType,
    Asset,
    Wallet,
    FungibleAssetProvider,
    NonFungibleAssetProvider,
    Transaction,
    AddressName,
    CryptoPrice,
    ERC721TokenCollectionInfo,
    SendOverrides,
    RequestOptions,
} from '../types'
import type { ProviderProxy } from '@masknet/web3-shared-base'

export interface Web3ProviderType {
    allowTestnet: Subscription<boolean>
    chainId: Subscription<ChainId>
    account: Subscription<string>
    networkType: Subscription<NetworkType>
    providerType: Subscription<ProviderType>
    tokenPrices: Subscription<CryptoPrice>
    wallets: Subscription<Wallet[]>
    walletPrimary: Subscription<Wallet | null>
    erc20Tokens: Subscription<ERC20TokenDetailed[]>
    erc721Tokens: Subscription<ERC721TokenDetailed[]>
    erc1155Tokens: Subscription<ERC1155TokenDetailed[]>
    portfolioProvider: Subscription<FungibleAssetProvider>

    addToken: (token: ERC20TokenDetailed | NonFungibleTokenDetailed) => Promise<void>
    removeToken: (token: ERC20TokenDetailed | NonFungibleTokenDetailed) => Promise<void>
    trustToken: (address: string, token: ERC20TokenDetailed | NonFungibleTokenDetailed) => Promise<void>
    blockToken: (address: string, token: ERC20TokenDetailed | NonFungibleTokenDetailed) => Promise<void>

    request: <T extends unknown>(
        requestArguments: RequestArguments,
        overrides?: SendOverrides,
        options?: RequestOptions,
    ) => Promise<T>
    getSendOverrides?: () => SendOverrides
    getRequestOptions?: () => RequestOptions

    getAssetsList: (address: string, provider: FungibleAssetProvider, network?: NetworkType) => Promise<Asset[]>
    getAssetsListNFT: (
        address: string,
        chainId: ChainId,
        provider: NonFungibleAssetProvider,
        page?: number,
        size?: number,
        collection?: string,
    ) => Promise<{ assets: ERC721TokenDetailed[]; hasNextPage: boolean }>
    getCollectionsNFT: (
        address: string,
        chainId: ChainId,
        provider: NonFungibleAssetProvider,
        page?: number,
        size?: number,
    ) => Promise<{ collections: ERC721TokenCollectionInfo[]; hasNextPage: boolean }>
    getAddressNamesList: (identity: {
        identifier: {
            userId: string
            network: string
        }
        avatar?: string
        bio?: string
        nickname?: string
        homepage?: string
    }) => Promise<AddressName[]>
    getTransactionList: (
        address: string,
        network: NetworkType,
        provider: FungibleAssetProvider,
        page?: number,
        size?: number,
    ) => Promise<{
        transactions: Transaction[]
        hasNextPage: boolean
    }>
    fetchERC20TokensFromTokenLists: (urls: string[], chainId: ChainId) => Promise<ERC20TokenDetailed[]>
    providerSocket: Promise<ProviderProxy>
}
