import type { Subscription } from 'use-subscription'
import type { JsonRpcPayload } from 'web3-core-helpers'
import type { Emitter } from '@servie/events'
import type {
    ECKeyIdentifier,
    EnhanceableSite,
    ExtensionSite,
    NetworkPluginID,
    NextIDPlatform,
    BindingProof,
    Proof,
    Account,
    Wallet,
    Color,
    Pageable,
    PageIndicator,
    SocialAddress,
    SocialIdentity,
    SocialAccount,
} from '@masknet/shared-base'
import type {
    ReturnChainResolver,
    ReturnExplorerResolver,
    ReturnNetworkResolver,
    ReturnProviderResolver,
} from '../helpers/index.js'

export enum CurrencyType {
    NATIVE = 'native',
    BTC = 'btc',
    USD = 'usd',
}

export enum OrderSide {
    Buy = 0,
    Sell = 1,
}

export enum GasOptionType {
    FAST = 'fast',
    NORMAL = 'normal',
    SLOW = 'slow',
}

export enum TokenType {
    Fungible = 'Fungible',
    NonFungible = 'NonFungible',
}

export enum SourceType {
    // FT assets
    DeBank = 'DeBank',
    Zerion = 'Zerion',
    Flow = 'Flow',
    Solana = 'Solana',
    CoinGecko = 'CoinGecko',
    CoinMarketCap = 'CoinMarketCap',
    UniswapInfo = 'UniswapInfo',
    CF = 'CloudFlare',
    GoPlus = 'GoPlus',

    // NFT assets
    Rabby = 'Rabby',
    Gem = 'Gem',
    RSS3 = 'RSS3',
    Zora = 'zora',
    OpenSea = 'opensea',
    Rarible = 'rarible',
    LooksRare = 'looksrare',
    NFTScan = 'NFTScan',
    Alchemy_EVM = 'Alchemy_EVM',
    Alchemy_FLOW = 'Alchemy_FLOW',
    Chainbase = 'Chainbase',
    X2Y2 = 'X2Y2',
    MagicEden = 'MagicEden',
    Element = 'Element',
    Solsea = 'Solsea',
    Solanart = 'Solanart',
    OKX = 'OKX',
    Uniswap = 'Uniswap',
    NFTX = 'NFTX',
    Etherscan = 'Etherscan',
    CryptoPunks = 'CryptoPunks',
    SimpleHash = 'SimpleHash',

    // Rarity
    RaritySniper = 'RaritySniper',
    TraitSniper = 'TraitSniper',

    // Token List
    R2D2 = 'R2D2',

    Approval = 'Approval',
}

export enum SearchResultType {
    // e.g., 0x6a7122B831c2B79c508A978f73f2ee23171279B3
    EOA = 'EOA',
    // e.g., vitalik.eth or vitalik.bnb
    Domain = 'Domain',
    // e.g., $MASK #MASK or its address 0x69af81e73a73b40adf4f3d4223cd9b1ece623074
    FungibleToken = 'FungibleToken',
    // e.g., #APE
    NonFungibleToken = 'NonFungibleToken',
    // e.g., #punks
    NonFungibleCollection = 'NonFungibleCollection',
    // e.g., realMaskNetwork
    CollectionListByTwitterHandler = 'CollectionListByTwitterHandler',
    // e.g., PancakeSwap
    DAO = 'DAO',
}

export enum ActivityType {
    Transfer = 'Transfer',
    Mint = 'Mint',
    Sale = 'Sale',
    Offer = 'Offer',
    Burn = 'Burn',
    List = 'List',
    CancelOffer = 'CancelOffer',
}

export enum TransactionStatusType {
    NOT_DEPEND = 1,
    SUCCEED = 2,
    FAILED = 3,
}

export enum TransactionDescriptorType {
    /** Transfer on chain value. */
    TRANSFER = 'transfer',
    /** A transaction to operate state mutations. */
    INTERACTION = 'interaction',
    /** A transaction to deploy programs. */
    DEPLOYMENT = 'deployment',
    /** A transaction to cancel a previous transaction. */
    CANCEL = 'cancel',
    /** A transaction to modify a previous transaction. */
    RETRY = 'retry',
}

export enum StorageProviderType {
    NextID = 'NextID',
    // KV storage powered by CloudFlare
    KV = 'kv',
    // RSS3 File API
    RSS3 = 'RSS3',

    String = 'String',
}

export enum FontSize {
    X_Small = 'xSmall',
    Small = 'small',
    Normal = 'normal',
    Large = 'large',
    X_Large = 'xLarge',
}

export enum ThemeMode {
    Light = 'light',
    Dark = 'dark',
}

export enum ThemeColor {
    Blue = 'rgb(37, 99, 235)',
}

export interface ThemeSettings {
    size: FontSize
    color: string
    mode: ThemeMode
}

export interface Identity {
    address?: string
    nickname?: string
    avatarURL?: string
    link?: string
}

export type Price = {
    [key in CurrencyType]?: string
}

export interface ChainDescriptor<ChainId, SchemaType, NetworkType> {
    type: NetworkType
    chainId: ChainId
    coinMarketCapChainId: string
    coinGeckoChainId: string
    coinGeckoPlatformId: string
    name: string
    color?: string
    fullName?: string
    shortName?: string
    network: 'mainnet' | 'testnet' | Omit<string, 'mainnet' | 'testnet'>
    nativeCurrency: FungibleToken<ChainId, SchemaType>
    // EIP3091
    explorerURL: {
        url: string
        parameters?: Record<string, string | number | boolean>
    }
    features?: string[]
}

export interface NetworkDescriptor<ChainId, NetworkType> {
    /** An unique ID for each network */
    ID: string
    /** The ID of the plugin that provides the functionality of the network. */
    networkSupporterPluginID: NetworkPluginID
    /** The chain id */
    chainId: ChainId
    /** The network type */
    type: NetworkType
    /** The network icon */
    icon: URL
    /** The network icon in fixed color */
    iconColor: Color
    /** The average time for mining a block (unit: seconds). */
    averageBlockDelay: number
    /** The background gradient color for relative network bar */
    backgroundGradient?: string
    /** The network name */
    name: string
    /** The network short name */
    shortName?: string
    /** Is a mainnet network */
    isMainnet: boolean
}

export interface ProviderDescriptor<ChainId, ProviderType> {
    /** An unique ID for each wallet provider */
    ID: string
    /** The ID of a plugin that provides the adoption of this provider. */
    providerAdaptorPluginID: NetworkPluginID
    /** The provider type */
    type: ProviderType
    /** The provider icon */
    icon: URL
    /** The provider name */
    name: string
    /** The provider bar background gradient color */
    backgroundGradient?: string
    /** The provider icon filter color */
    iconFilterColor?: string
    /** Enable requirements */
    enableRequirements?: {
        supportedChainIds?: ChainId[]
        supportedEnhanceableSites?: EnhanceableSite[]
        supportedExtensionSites?: ExtensionSite[]
    }
    /** A link to provider's home website */
    homeLink: string
    /** A link only contains domain name */
    shortenLink: string
    /** A link to download the client application */
    downloadLink?: string
}

export interface Token<ChainId, SchemaType> {
    id: string
    chainId: ChainId
    type: TokenType
    schema: SchemaType
    address: string
}

export interface FungibleToken<ChainId, SchemaType> extends Token<ChainId, SchemaType> {
    name: string
    symbol: string
    decimals: number
    logoURL?: string
    // Sorted by market cap.
    rank?: number
}

export interface FungibleTokenStats {}

export interface NonFungibleTokenStats {
    volume24h: number
    count24h: number
    floorPrice: number
}

export interface NonFungibleTokenRarity<ChainId> {
    chainId: ChainId
    rank: number
    url: string
    status?: 'verified' | 'unverified'
    /** source type */
    source?: SourceType
}

export interface NonFungibleTokenContract<ChainId, SchemaType> {
    chainId: ChainId
    name: string
    symbol?: string
    address: string
    schema: SchemaType
    owner?: string
    balance?: number
    logoURL?: string
    iconURL?: string
    /** @example 2.5% */
    creatorEarning?: string
    /** source type */
    source?: SourceType
}

export interface NonFungibleTokenMetadata<ChainId> {
    chainId: ChainId
    /** Might be the format `TheName #42` */
    name: string
    tokenId?: string
    symbol?: string
    description?: string
    /** image url */
    imageURL?: string
    previewImageURL?: string
    /** Useful for progress loading */
    blurhash?: string
    /** source media url */
    mediaURL?: string
    /** source media type */
    mediaType?: string
    /** project url */
    projectURL?: string
    /** source type */
    source?: SourceType
}

export interface SocialLinks {
    website?: string
    email?: string
    twitter?: string
    discord?: string
    telegram?: string
    github?: string
    instagram?: string
    medium?: string
}

export interface NonFungibleCollection<ChainId, SchemaType> {
    chainId: ChainId
    name: string
    slug: string
    symbol?: string
    description?: string
    /** some providers define id, while others don't. For those don't, we will fallback to contract address */
    id?: string
    address?: string
    schema?: SchemaType
    iconURL?: string | null
    /** the balance of the current owner */
    balance?: number
    /** the amount of holders */
    ownersTotal?: number
    /** verified by provider */
    verified?: boolean
    verifiedBy?: string[]
    /** unix timestamp */
    createdAt?: number
    /** source type */
    source?: SourceType
    assets?: Array<NonFungibleAsset<ChainId, SchemaType>>
    socialLinks?: SocialLinks
}

export interface NonFungibleCollectionOverview {
    // collection name
    collection?: string
    market_cap?: number
    highest_price?: number
    volume_24h?: number
    average_price_24h?: number
    average_price_change_1d: string
    average_price_change: string
    average_price_change_7d: string
    sales_24h?: number
    owners_total?: number
    total_volume?: number
    items_total?: number
    sales?: number
    volume?: number
    average_price?: number
}

export interface NonFungibleTokenActivity<ChainId, SchemaType> {
    hash: string
    event_type: ActivityType
    transaction_link: string
    timestamp: number
    nftscan_uri: string
    trade_price?: number
    // The param `from` of the transaction
    from: string
    // The param `to` of the transaction
    to: string
    // The user address who received the NFT
    receive: string
    // The user address who sent the NFT
    send: string
    cover: string
    contract_address: string
    token_id?: string
    trade_token?: FungibleToken<ChainId, SchemaType>
    trade_symbol?: string
    // #region solana
    source?: string
    destination?: string
    fee?: number
    tx_interact_program?: string
    token_address?: string
    // #endregion
}

export interface NonFungibleToken<ChainId, SchemaType> extends Token<ChainId, SchemaType> {
    /** the token id */
    tokenId: string
    /** the address or uid of the token owner */
    ownerId?: string
    /** the contract info */
    contract?: NonFungibleTokenContract<ChainId, SchemaType>
    /** the media metadata */
    metadata?: NonFungibleTokenMetadata<ChainId>
    /** the collection info */
    collection?: NonFungibleCollection<ChainId, SchemaType>
}

export interface NonFungibleTokenTrait {
    /** The type of trait. */
    type: string
    /** The value of trait. */
    value: string
    /** The rarity of trait in percentage. */
    rarity?: string
}

export interface NonFungibleTokenAuction<ChainId, SchemaType> {
    /** unix timestamp */
    startAt?: number
    /** unix timestamp */
    endAt?: number
    /** tokens available to make an order */
    orderTokens?: Array<FungibleToken<ChainId, SchemaType>>
    /** tokens available to make an offer */
    offerTokens?: Array<FungibleToken<ChainId, SchemaType>>
}

export interface NonFungibleTokenOrder<ChainId, SchemaType> {
    id: string
    /** chain Id */
    chainId: ChainId
    /** permalink of asset */
    assetPermalink: string
    /** token amount */
    quantity: string
    /** transaction hash */
    hash?: string
    /** buy or sell */
    side?: OrderSide
    /** the account make the order */
    maker?: Identity
    /** the account fullfil the order */
    taker?: Identity
    /** unix timestamp */
    createdAt?: number
    /** unix timestamp */
    expiredAt?: number
    /** calculated current price */
    price?: Price
    /** the payment token and corresponding price */
    priceInToken?: PriceInToken<ChainId, SchemaType>
    /** source type */
    source?: SourceType
}

export interface NonFungibleTokenEvent<ChainId, SchemaType> {
    id: string
    /** chain Id */
    chainId: ChainId
    /** event type */
    type: ActivityType
    /** permalink of asset */
    assetPermalink?: string
    /** name of asset */
    assetName?: string
    /** symbol of asset */
    assetSymbol?: string
    /** token amount */
    quantity: string
    /** transaction hash */
    hash?: string
    /** the account make the order */
    from?: Identity
    /** the account fullfil the order */
    to?: Identity
    /** the account who send the token */
    send?: Identity
    /** the account who receive the token */
    receive?: Identity
    /** unix timestamp */
    timestamp: number
    /** relate token price */
    price?: Price
    /** the payment token and corresponding price */
    priceInToken?: PriceInToken<ChainId, SchemaType>
    /** the payment token */
    paymentToken?: FungibleToken<ChainId, SchemaType>
    /** source type */
    source?: SourceType
}

/**
 * A fungible token but with more metadata
 */
export interface FungibleAsset<ChainId, SchemaType> extends FungibleToken<ChainId, SchemaType> {
    /** currently balance */
    balance: string
    /** estimated price */
    price?: Price
    /** estimated value */
    value?: Price
}

export interface PriceInToken<ChainId, SchemaType> {
    amount: string
    token: FungibleToken<ChainId, SchemaType>
}

/**
 * A non-fungible token but with more metadata
 */
export interface NonFungibleAsset<ChainId, SchemaType> extends NonFungibleToken<ChainId, SchemaType> {
    /** permalink */
    link?: string
    /** the creator data */
    creator?: Identity
    /** the owner data */
    owner?: Identity
    /** estimated price */
    price?: Price
    /** rarity */
    rarity?: Record<SourceType, NonFungibleTokenRarity<ChainId>>
    /** traits of the digital asset */
    traits?: NonFungibleTokenTrait[]
    /** token on auction */
    auction?: NonFungibleTokenAuction<ChainId, SchemaType>
    /** related orders */
    orders?: Array<NonFungibleTokenOrder<ChainId, SchemaType>>
    /** related events */
    events?: Array<NonFungibleTokenEvent<ChainId, SchemaType>>
    /** all payment tokens */
    paymentTokens?: Array<FungibleToken<ChainId, SchemaType>>
    /** the payment token and corresponding price */
    priceInToken?: PriceInToken<ChainId, SchemaType>
    /** source type */
    source?: SourceType
}

/**
 * Authorization about a fungible token.
 */
export interface FungibleTokenSpender<ChainId, SchemaType> {
    tokenInfo: Pick<FungibleToken<ChainId, SchemaType>, 'address' | 'logoURL' | 'symbol' | 'name'>
    /** spender address */
    address: string
    /** spender name */
    name: string | undefined
    /** spender logo */
    logo: React.ReactNode | undefined
    /** allowance token amount of this spender */
    amount: number
}

/**
 * Authorization about a non-fungible contract.
 */
export interface NonFungibleContractSpender<ChainId, SchemaType> {
    amount: string
    contract: Pick<NonFungibleTokenContract<ChainId, SchemaType>, 'name' | 'address'>
    address: string
    name: string | undefined
    logo: React.ReactNode | undefined
}

/**
 * The security diagnosis about a fungible token.
 */
export interface FungibleTokenSecurity {}

/**
 * The security diagnosis about a non-fungible token.
 */
export interface NonFungibleTokenSecurity {}

export interface Result<ChainId> {
    pluginID: NetworkPluginID
    chainId: ChainId
    type: SearchResultType
    /** The original searched keyword */
    keyword: string
    /** alias name list, e.g. binance for bnb. */
    alias?: Array<{
        value: string
        // If pin this to top of results
        isPin?: boolean
    }>
}

export interface EOAResult<ChainId> extends Result<ChainId> {
    type: SearchResultType.EOA
    domain?: string
    bindingProofs?: BindingProof[]
    address: string
}

export interface DAOResult<ChainId> extends Result<ChainId> {
    type: SearchResultType.DAO
    keyword: string
    spaceId: string
    spaceName: string
    twitterHandler: string
    avatar: string
    followersCount: number
    strategyName?: string
    isVerified: boolean
    alias?: Array<{
        value: string
        isPin?: boolean
    }>
}

export interface DomainResult<ChainId> extends Result<ChainId> {
    type: SearchResultType.Domain
    domain?: string
    address?: string
}

export interface FungibleTokenResult<ChainId, SchemaType> extends Result<ChainId> {
    type: SearchResultType.FungibleToken
    /** The id of token on the provider platform */
    id?: string
    address?: string
    rank?: number
    logoURL?: string
    name: string
    symbol: string
    source: SourceType
    token?: FungibleToken<ChainId, SchemaType>
    socialLinks?: SocialLinks
}

export interface NonFungibleTokenResult<ChainId, SchemaType> extends Result<ChainId> {
    type: SearchResultType.NonFungibleToken | SearchResultType.NonFungibleCollection
    id?: string
    address: string
    rank?: number
    logoURL?: string
    name: string
    symbol?: string
    tokenId?: string
    source: SourceType
    token?: NonFungibleToken<ChainId, SchemaType>
}

export type TokenResult<ChainId, SchemaType> =
    | FungibleTokenResult<ChainId, SchemaType>
    | NonFungibleTokenResult<ChainId, SchemaType>
    | NonFungibleCollectionResult<ChainId, SchemaType>

export interface NonFungibleCollectionResult<ChainId, SchemaType> extends Result<ChainId> {
    type: SearchResultType.CollectionListByTwitterHandler
    address: string
    id?: string
    rank?: number
    logoURL?: string
    name: string
    symbol?: string
    source: SourceType
    collection?: NonFungibleCollection<ChainId, SchemaType>
}

export type SearchResult<ChainId, SchemaType> =
    | EOAResult<ChainId>
    | DomainResult<ChainId>
    | FungibleTokenResult<ChainId, SchemaType>
    | NonFungibleTokenResult<ChainId, SchemaType>
    | NonFungibleCollectionResult<ChainId, SchemaType>
    | DAOResult<ChainId>

/**
 * Plugin can declare what chain it supports to trigger side effects (e.g. create a new transaction).
 * When the current chain is not supported, the composition entry will be hidden.
 */
export type Web3EnableRequirement = Partial<
    Record<
        NetworkPluginID,
        {
            supportedChainIds?: number[]
        }
    >
>

export interface TransactionDescriptor<ChainId, Transaction, Parameter = string | undefined> {
    chainId: ChainId
    /** The transaction type */
    type: TransactionDescriptorType
    /** a transaction title. */
    title: string
    context?: TransactionContext<ChainId, Parameter>
    /** The original transaction object */
    _tx: Transaction
    /** The address of the token leveraged to swap other tokens */
    tokenInAddress?: string
    /** The amount of the token leveraged to swap other tokens */
    tokenInAmount?: string
    /** a human-readable description. */
    description?: string
    snackbar?: {
        /** a human-readable description for successful transaction. */
        successfulDescription?: string
        /** a human-readable title for successful transaction. */
        successfulTitle?: string
        /** a human-readable description for failed transaction. */
        failedDescription?: string
        /** a human-readable title for failed transaction. */
        failedTitle?: string
    }
    popup?: {
        /** The custom token description */
        tokenDescription?: string
    }
}

export interface TransactionContext<ChainId, Parameter = string | undefined> {
    /** the descriptor type */
    type: TransactionDescriptorType
    /** chain id */
    chainId: ChainId
    /** the from address. */
    from: string
    /** the to address */
    to: string
    /** the value amount (polyfill to 0x0 if absent in the original transaction) */
    value: string
    /** code to deploy */
    code?: string
    /** transaction hash */
    hash?: string
    /** methods */
    methods?: Array<{
        /** name */
        name?: string
        /** actual parameters */
        parameters?: {
            [key: string]: Parameter
        }
    }>
    /** nested children contexts */
    children?: Array<TransactionContext<ChainId, Parameter>>
}

export interface AddressName {
    id: string
    /** eg. vitalik.eth */
    label: string
    /** eg. 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 */
    ownerAddress: string
    /** eg. 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 */
    resolvedAddress?: string
}

export interface Transaction<ChainId, SchemaType> {
    id: string
    chainId: ChainId
    type?: string
    filterType?: string
    from: string
    to: string
    /** unix timestamp */
    timestamp: number
    /** 0: failed 1: succeed */
    status?: 0 | 1
    /** transferred tokens */
    tokens: Array<
        Token<ChainId, SchemaType> & {
            name: string
            symbol: string
            amount: string
            direction: string
        }
    >
    /** estimated tx fee */
    fee?: Price
    input?: string
    hash?: string
    methodId?: string
    blockNumber?: number
}

export interface RecentTransaction<ChainId, Transaction> {
    /** the initial transaction id */
    id: string
    /** the id for accessing tx from candidates */
    indexId: string
    /** the chain id */
    chainId: ChainId
    /** status type */
    status: TransactionStatusType
    /** all available tx candidates */
    candidates: Record<string, Transaction>
    /** record created at */
    createdAt: Date
    /** record updated at */
    updatedAt: Date
}

export type RecentTransactionComputed<ChainId, Transaction> = RecentTransaction<ChainId, Transaction> & {
    /** a dynamically computed field in the hook which means the minted (initial) transaction */
    _tx: Transaction
}

export interface TokenList<ChainId, SchemaType> {
    name: string
    description?: string
    /** fungible or non-fungible tokens */
    tokens: Array<Token<ChainId, SchemaType>>
}

export interface BalanceEvent<ChainId> {
    /** Emit if the balance of the account updated. */
    update: [Account<ChainId>]
}

export interface BlockNumberEvent<ChainId> {
    /** Emit if the balance of the chain updated. */
    update: [ChainId]
}

export interface RecognizableError extends Error {
    isRecognized?: boolean
}

export interface WatchEvents<ChainId, Transaction> {
    /** Emit when error occur */
    error: [RecognizableError, JsonRpcPayload]
    /** Emit when the watched transaction status updated. */
    progress: [ChainId, string, TransactionStatusType, Transaction | undefined]
}

export interface TransactionChecker<ChainId, Transaction> {
    getStatus(chainId: ChainId, id: string, transaction: Transaction): Promise<TransactionStatusType>
}

export interface ConnectionOptions<ChainId, ProviderType, Transaction> {
    /** Designate the signer of the transaction. */
    account?: string
    /** Designate the sub-network id of the transaction. */
    chainId?: ChainId
    /** an abstract wallet has a owner */
    owner?: string
    /** persona identifier */
    identifier?: ECKeyIdentifier
    /** Designate the provider to handle the transaction. */
    providerType?: ProviderType
    /** Gas payment token. */
    paymentToken?: string
    /** Only Support Mask Wallet, silent switch wallet */
    silent?: boolean
    /** Fragments to merge into the transaction. */
    overrides?: Partial<Transaction>
    /** Termination signal */
    signal?: AbortSignal
}
export interface Connection<
    ChainId,
    AddressType,
    SchemaType,
    ProviderType,
    Signature,
    Block,
    Operation,
    Transaction,
    TransactionReceipt,
    TransactionDetailed,
    TransactionSignature,
    Web3,
    Web3Provider,
    Web3ConnectionOptions = ConnectionOptions<ChainId, ProviderType, Transaction>,
> {
    /** Get web3 instance */
    getWeb3(initial?: Web3ConnectionOptions): Web3
    /** Get web3 provider instance */
    getWeb3Provider(initial?: Web3ConnectionOptions): Web3Provider
    /** Get the latest balance of the account. */
    getBalance(address: string, initial?: Web3ConnectionOptions): Promise<string>
    /** Get native fungible token balance. */
    getNativeTokenBalance(initial?: Web3ConnectionOptions): Promise<string>
    /** Get fungible token balance. */
    getFungibleTokenBalance(address: string, schema?: SchemaType, initial?: Web3ConnectionOptions): Promise<string>
    /** Get non-fungible token balance. */
    getNonFungibleTokenBalance(
        address: string,
        tokenId?: string,
        schema?: SchemaType,
        initial?: Web3ConnectionOptions,
    ): Promise<string>
    /** Get fungible token balance. */
    getFungibleTokensBalance(listOfAddress: string[], initial?: Web3ConnectionOptions): Promise<Record<string, string>>
    /** Get non-fungible token balance. */
    getNonFungibleTokensBalance(
        listOfAddress: string[],
        initial?: Web3ConnectionOptions,
    ): Promise<Record<string, string>>
    /** Get gas price */
    getGasPrice(initial?: Web3ConnectionOptions): Promise<string>
    /** Get the source code of a on-chain program. */
    getCode(address: string, initial?: Web3ConnectionOptions): Promise<string>
    /** Get address type of given address. */
    getAddressType(address: string, initial?: Web3ConnectionOptions): Promise<AddressType | undefined>
    /** Get schema type of given token address. */
    getSchemaType(address: string, initial?: Web3ConnectionOptions): Promise<SchemaType | undefined>
    /** Get the latest block by number. */
    getBlock(no: number, initial?: Web3ConnectionOptions): Promise<Block | null>
    /** Get the latest block number. */
    getBlockNumber(initial?: Web3ConnectionOptions): Promise<number>
    /** Get the latest block unix timestamp. */
    getBlockTimestamp(initial?: Web3ConnectionOptions): Promise<number>
    /** Get the detailed of transaction by id. */
    getTransaction(id: string, initial?: Web3ConnectionOptions): Promise<TransactionDetailed | null>
    /** Get the transaction receipt. */
    getTransactionReceipt(id: string, initial?: Web3ConnectionOptions): Promise<TransactionReceipt | null>
    /** Get the latest transaction status. */
    getTransactionStatus(id: string, initial?: Web3ConnectionOptions): Promise<TransactionStatusType>
    /** Get the latest transaction nonce. */
    getTransactionNonce(address: string, initial?: Web3ConnectionOptions): Promise<number>
    /** Get a native fungible token. */
    getNativeToken(initial?: Web3ConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>>
    /** Get a fungible token. */
    getFungibleToken(address: string, initial?: Web3ConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>>
    /** Get a non-fungible token. */
    getNonFungibleToken(
        address: string,
        tokenId: string | undefined,
        schema?: SchemaType,
        initial?: Web3ConnectionOptions,
    ): Promise<NonFungibleToken<ChainId, SchemaType>>
    getNonFungibleTokenOwner(
        address: string,
        tokenId: string | undefined,
        schema?: SchemaType,
        initial?: Web3ConnectionOptions,
    ): Promise<string>
    getNonFungibleTokenOwnership(
        address: string,
        tokenId: string | undefined,
        owner: string,
        schema?: SchemaType,
        initial?: Web3ConnectionOptions,
    ): Promise<boolean>
    getNonFungibleTokenMetadata(
        address: string,
        tokenId: string | undefined,
        schema?: SchemaType,
        initial?: Web3ConnectionOptions,
    ): Promise<NonFungibleTokenMetadata<ChainId>>
    /** Get a non-fungible token contract. */
    getNonFungibleTokenContract(
        address: string,
        schema?: SchemaType,
        initial?: Web3ConnectionOptions,
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType>>
    /** Get a non-fungible token collection. */
    getNonFungibleTokenCollection(
        address: string,
        schema?: SchemaType,
        initial?: Web3ConnectionOptions,
    ): Promise<NonFungibleCollection<ChainId, SchemaType>>
    /** Get the currently connected account. */
    getAccount(initial?: Web3ConnectionOptions): Promise<string>
    /** Get the currently chain id. */
    getChainId(initial?: Web3ConnectionOptions): Promise<ChainId>
    /** Switch to sub network */
    switchChain?: (chainId: ChainId, initial?: Web3ConnectionOptions) => Promise<void>
    /** Sign message */
    signMessage(type: string, message: string, initial?: Web3ConnectionOptions): Promise<Signature>
    /** Verify message */
    verifyMessage(
        type: string,
        message: string,
        signature: Signature,
        initial?: Web3ConnectionOptions,
    ): Promise<boolean>
    /** Approve a recipient for using a fungible token. */
    approveFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        initial?: Web3ConnectionOptions,
    ): Promise<string>
    /** Approve a recipient for using a non-fungible token. */
    approveNonFungibleToken(
        address: string,
        recipient: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: Web3ConnectionOptions,
    ): Promise<string>
    /** Approve a recipient for using all non-fungible tokens. */
    approveAllNonFungibleTokens(
        address: string,
        recipient: string,
        approved: boolean,
        schema?: SchemaType,
        initial?: Web3ConnectionOptions,
    ): Promise<string>
    /** Transfer fungible token to */
    transferFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        memo?: string,
        initial?: Web3ConnectionOptions,
    ): Promise<string>
    /** Transfer non-fungible token to */
    transferNonFungibleToken(
        address: string | undefined,
        tokenId: string,
        recipient: string,
        amount: string,
        schema?: SchemaType,
        initial?: Web3ConnectionOptions,
    ): Promise<string>
    /** Get all supported entry points */
    supportedEntryPoints?: () => Promise<string[]>
    /** Call a operation */
    callUserOperation?: (owner: string, operation: Operation, initial?: Web3ConnectionOptions) => Promise<string>
    /** Send a operation */
    sendUserOperation?: (
        owner: string,
        operation: Operation,
        initial?: Web3ConnectionOptions,
    ) => Promise<TransactionSignature>
    /** Transfer some native tokens from contract wallet */
    transfer?: (recipient: string, amount: string, initial?: Web3ConnectionOptions) => Promise<string>
    /** Change owner of contract wallet */
    changeOwner?: (recipient: string, initial?: Web3ConnectionOptions) => Promise<string>
    /** Fund contract wallet */
    fund?: (proof: Proof, initial?: Web3ConnectionOptions) => Promise<string>
    /** Deploy contract wallet */
    deploy?: (owner: string, identifier?: ECKeyIdentifier, initial?: Web3ConnectionOptions) => Promise<string>
    /** Sign a transaction */
    signTransaction(transaction: Transaction, initial?: Web3ConnectionOptions): Promise<TransactionSignature>
    /** Sign multiple transactions */
    signTransactions(transactions: Transaction[], initial?: Web3ConnectionOptions): Promise<TransactionSignature[]>
    /** Query a transaction */
    callTransaction(transaction: Transaction, initial?: Web3ConnectionOptions): Promise<string>
    /** Send a transaction and wait for mining */
    sendTransaction(transaction: Transaction, initial?: Web3ConnectionOptions): Promise<string>
    /** Estimate a transaction  */
    estimateTransaction?: (
        transaction: Transaction,
        fallback?: number,
        initial?: Web3ConnectionOptions,
    ) => Promise<string>
    /** Send a signed transaction */
    sendSignedTransaction(signature: TransactionSignature, initial?: Web3ConnectionOptions): Promise<string>
    /** Build connection */
    connect(initial?: Web3ConnectionOptions): Promise<Account<ChainId>>
    /** Break connection */
    disconnect(initial?: Web3ConnectionOptions): Promise<void>
    /** Get all wallets. */
    getWallets?: (initial?: Web3ConnectionOptions) => Promise<Wallet[]>
    /** Add a new wallet. */
    addWallet?: (wallet: Wallet, initial?: Web3ConnectionOptions) => Promise<void>
    /** Update a wallet. */
    updateWallet?: (address: string, wallet: Wallet, initial?: Web3ConnectionOptions) => Promise<void>
    /** Add or update a new wallet on demand. */
    updateOrAddWallet?: (wallet: Wallet, initial?: Web3ConnectionOptions) => Promise<void>
    /** Rename a wallet */
    renameWallet?: (address: string, name: string, initial?: Web3ConnectionOptions) => Promise<void>
    /** Remove a wallet */
    removeWallet?: (address: string, password?: string | undefined, initial?: Web3ConnectionOptions) => Promise<void>
    /** Update a bunch of wallets. */
    updateWallets?: (wallets: Wallet[], initial?: Web3ConnectionOptions) => Promise<void>
    /** Remove a bunch of wallets. */
    removeWallets?: (wallets: Wallet[], initial?: Web3ConnectionOptions) => Promise<void>
    /** Confirm transaction */
    confirmTransaction(hash: string, initial?: Web3ConnectionOptions): Promise<TransactionReceipt>
    /** Replace transaction */
    replaceTransaction(hash: string, config: Transaction, initial?: Web3ConnectionOptions): Promise<void>
    /** Cancel transaction */
    cancelTransaction(hash: string, config: Transaction, initial?: Web3ConnectionOptions): Promise<void>
}

export interface HubOptions<ChainId, Indicator = PageIndicator> {
    /** The user account as the API parameter */
    account?: string
    /** The chain id as the API parameter */
    chainId?: ChainId
    /** The networkPluginID as the API parameter */
    networkPluginId?: NetworkPluginID
    /** The id of data provider */
    sourceType?: SourceType
    /** The currency type of data */
    currencyType?: CurrencyType
    /** The item size of each page. */
    size?: number
    /** The page index. */
    indicator?: Indicator
    allChains?: boolean
}

export interface HubFungible<ChainId, SchemaType, GasOption, Web3HubOptions = HubOptions<ChainId>> {
    getFungibleToken?: (
        address: string,
        initial?: Web3HubOptions,
    ) => Promise<FungibleToken<ChainId, SchemaType> | undefined>
    /** Get a fungible asset. */
    getFungibleAsset?: (
        address: string,
        initial?: Web3HubOptions,
    ) => Promise<FungibleAsset<ChainId, SchemaType> | undefined>
    /** Get fungible assets owned by the given account. */
    getFungibleAssets?: (
        account: string,
        initial?: Web3HubOptions,
    ) => Promise<Pageable<FungibleAsset<ChainId, SchemaType>>>
    /** Get fungible assets owned by the give trusted fungible token. */
    getTrustedFungibleAssets?: (
        account: string,
        trustedFungibleTokens?: Array<FungibleToken<ChainId, SchemaType>>,
        initial?: Web3HubOptions,
    ) => Promise<Pageable<FungibleAsset<ChainId, SchemaType>>>
    /** Get balance of a fungible token owned by the given account. */
    getFungibleTokenBalance?: (address: string, initial?: Web3HubOptions) => Promise<number>
    /** Get stats data of a fungible token */
    getFungibleTokenStats?: (address: string, initial?: Web3HubOptions) => Promise<FungibleTokenStats>
    /** Get security diagnosis about a fungible token. */
    getFungibleTokenSecurity?: (
        chainId: ChainId,
        address: string,
        initial?: Web3HubOptions,
    ) => Promise<FungibleTokenSecurity>
    /** Get fungible tokens from built-in token list. */
    getFungibleTokensFromTokenList?: (
        chainId: ChainId,
        initial?: Web3HubOptions,
    ) => Promise<Array<FungibleToken<ChainId, SchemaType>>>
    /** Get price of a fungible token. */
    getFungibleTokenPrice?: (chainId: ChainId, address: string, initial?: Web3HubOptions) => Promise<number | undefined>
    /** Get token icon URLs that point to a fungible token. */
    getFungibleTokenIconURLs?: (chainId: ChainId, address: string, initial?: Web3HubOptions) => Promise<string[]>
    /** Get spenders of a fungible token approved by the given account. */
    getFungibleTokenSpenders?: (
        chainId: ChainId,
        account: string,
        initial?: Web3HubOptions,
    ) => Promise<Array<FungibleTokenSpender<ChainId, SchemaType>>>
}

export interface HubNonFungible<ChainId, SchemaType, GasOption, Web3HubOptions = HubOptions<ChainId>> {
    /** Get non-fungible assets of the given collection. */
    getNonFungibleAssetsByCollection?: (
        address: string,
        initial?: Web3HubOptions,
    ) => Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>>
    /** Get non-fungible assets of the given collection and owner. */
    getNonFungibleAssetsByCollectionAndOwner?: (
        collectionId: string,
        owner: string,
        initial?: Web3HubOptions,
    ) => Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>>
    /** Get a non-fungible token owner address. */
    getNonFungibleTokenOwner?: (address: string, tokenId: string, initial?: Web3HubOptions) => Promise<string>
    /** Get a non-fungible token floor price. */
    getNonFungibleTokenFloorPrice?: (
        address: string,
        tokenId: string,
        initial?: Web3HubOptions,
    ) => Promise<PriceInToken<ChainId, SchemaType> | undefined>
    /** Get a non-fungible contract. */
    getNonFungibleTokenContract?: (
        address: string,
        initial?: Web3HubOptions,
    ) => Promise<NonFungibleTokenContract<ChainId, SchemaType> | undefined>
    /** Get balance of non-fungible tokens in a collection owned by the given account. */
    getNonFungibleTokenBalance?: (address: string, initial?: Web3HubOptions) => Promise<number>
    /** Get stats data of a non-fungible token */
    getNonFungibleTokenStats?: (address: string, initial?: Web3HubOptions) => Promise<NonFungibleTokenStats>
    /** Get security diagnosis about a non-fungible token. */
    getNonFungibleTokenSecurity?: (
        chainId: ChainId,
        address: string,
        initial?: Web3HubOptions,
    ) => Promise<NonFungibleTokenSecurity>
    /** Get non-fungible tokens from built-in token list. */
    getNonFungibleTokensFromTokenList?: (
        chainId: ChainId,
        initial?: Web3HubOptions,
    ) => Promise<Array<NonFungibleToken<ChainId, SchemaType>>>
    /** Get price of a non-fungible token. */
    getNonFungibleTokenPrice?: (
        chainId: ChainId,
        address: string,
        tokenId: string,
        initial?: Web3HubOptions,
    ) => Promise<number>
    /** Get token icon URLs that point to a non-fungible token. */
    getNonFungibleTokenIconURLs?: (
        chainId: ChainId,
        address: string,
        tokenId?: string,
        initial?: Web3HubOptions,
    ) => Promise<string[]>
    /** Get contracts of a non-fungible token approved by the given account. */
    getNonFungibleTokenSpenders?: (
        chainId: ChainId,
        account: string,
        initial?: Web3HubOptions,
    ) => Promise<Array<NonFungibleContractSpender<ChainId, SchemaType>>>
    /** Get a non-fungible asset. */
    getNonFungibleAsset?: (
        address: string,
        tokenId: string,
        initial?: Web3HubOptions,
    ) => Promise<NonFungibleAsset<ChainId, SchemaType> | undefined>
    /** Get non-fungible assets owned by the given account. */
    getNonFungibleAssets?: (
        account: string,
        initial?: Web3HubOptions,
    ) => Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>>
    /** Get events of a non-fungible token. */
    getNonFungibleTokenEvents?: (
        address: string,
        tokenId: string,
        initial?: Web3HubOptions,
    ) => Promise<Pageable<NonFungibleTokenEvent<ChainId, SchemaType>>>
    /** Get listed orders of a non-fungible token. */
    getNonFungibleTokenListings?: (
        address: string,
        tokenId: string,
        initial?: Web3HubOptions,
    ) => Promise<Pageable<NonFungibleTokenOrder<ChainId, SchemaType>>>
    /** Get offered orders of a non-fungible token. */
    getNonFungibleTokenOffers?: (
        address: string,
        tokenId: string,
        initial?: Web3HubOptions,
    ) => Promise<Pageable<NonFungibleTokenOrder<ChainId, SchemaType>>>
    /** Get orders of a non-fungible token. */
    getNonFungibleTokenOrders?: (
        address: string,
        tokenId: string,
        side: OrderSide,
        initial?: Web3HubOptions,
    ) => Promise<Pageable<NonFungibleTokenOrder<ChainId, SchemaType>>>
    /** Get non-fungible collections owned by the given account. */
    getNonFungibleCollectionsByOwner?: (
        account: string,
        initial?: Web3HubOptions,
    ) => Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>>>
    /** Get collection verified-by by provider-defined id. */
    getNonFungibleCollectionVerifiedBy?: (id: string) => Promise<string[]>
    getNonFungibleRarity?: (
        address: string,
        tokenId: string,
        initial?: Web3HubOptions,
    ) => Promise<NonFungibleTokenRarity<ChainId> | undefined>

    /** Place a bid on a token. */
    createBuyOrder?: (/** TODO: add parameters */) => Promise<void>
    /** List a token for public sell. */
    createSellOrder?: (/** TODO: add parameters */) => Promise<void>
    /** Fulfill an order. */
    fulfillOrder?: (/** TODO: add parameters */) => Promise<void>
    /** Cancel an order. */
    cancelOrder?: (/** TODO: add parameters */) => Promise<void>
}

export interface Hub<ChainId, SchemaType, GasOption, Web3HubOptions = HubOptions<ChainId>>
    extends HubFungible<ChainId, SchemaType, GasOption, Web3HubOptions>,
        HubNonFungible<ChainId, SchemaType, GasOption, Web3HubOptions> {
    /** Get recommended gas options. */
    getGasOptions?: (
        chainId: ChainId,
        initial?: Web3HubOptions,
    ) => Promise<Record<GasOptionType, GasOption> | undefined>
    /** Get the most recent transactions of the given account. */
    getTransactions: (
        chainId: ChainId,
        account: string,
        initial?: Web3HubOptions,
    ) => Promise<Pageable<Transaction<ChainId, SchemaType>>>
}

export interface Storage {
    has(key: string): Promise<boolean>
    get<T>(key: string): Promise<T | undefined>
    getAll?<T>(key: string): Promise<T[] | undefined>
    set<T>(key: string, value: T): Promise<void>
    delete?(key: string): Promise<void>
    clearAll?(): Promise<void>
}

export interface SettingsState {
    ready: boolean
    readyPromise: Promise<void>

    /** Is testnets valid */
    allowTestnet?: Subscription<boolean>
    /** The currency of estimated values and prices. */
    currencyType?: Subscription<CurrencyType>
    /** The gas options type */
    gasOptionType?: Subscription<GasOptionType>
    /** The source type of fungible assets */
    fungibleAssetSourceType?: Subscription<SourceType>
    /** The source type of non-fungible assets */
    nonFungibleAssetSourceType?: Subscription<SourceType>
}

export interface AddressBookState<ChainId> {
    ready: boolean
    readyPromise: Promise<void>

    /** The tracked addresses of currently chosen sub-network */
    addressBook?: Subscription<string[]>

    /** Add an address into address book. */
    addAddress: (chainId: ChainId, address: string) => Promise<void>
    /** Remove an address from address book. */
    removeAddress: (chainId: ChainId, address: string) => Promise<void>
}
export interface RiskWarningState {
    ready: boolean
    readyPromise: Promise<void>

    /** Is approved */
    approved?: Subscription<boolean>

    /** Detect if an account is approved the statement */
    isApproved?: (address: string) => Promise<boolean>
    /** Approve statement of designate account */
    approve?: (address: string, pluginID?: string) => Promise<void>
    /** Revoke statement of designate account */
    revoke?: (address: string, pluginID?: string) => Promise<void>
}
export interface HubState<
    ChainId,
    SchemaType,
    GasOption,
    Web3HubOptions = HubOptions<ChainId>,
    Web3Hub = Hub<ChainId, SchemaType, GasOption>,
> {
    /** Get external data hub */
    getHub?: (options: Web3HubOptions) => Web3Hub
}

export interface Web3StorageServiceState {
    createStorage: (
        providerType: StorageProviderType,
        options: {
            namespace: string
            personaIdentifier?: ECKeyIdentifier
            platform?: NextIDPlatform
        },
    ) => Storage
    createKVStorage: (namespace: string) => Storage
    createRSS3Storage: (namespace: string) => Storage
    createNextIDStorage: (
        proofIdentity: string,
        platform: NextIDPlatform,
        signerOrPublicKey: string | ECKeyIdentifier,
    ) => Storage

    createStringStorage: (namespace: string, address: string) => Storage
}

export interface IdentityServiceState<ChainId> {
    /** Merge many social addresses into a social account. Don't overwrite it in sub-classes. */
    __mergeSocialAddressesAll__(socialAddresses: Array<SocialAddress<ChainId>>): Array<SocialAccount<ChainId>>
    /** Find all social addresses related to the given identity. */
    lookup(identity: SocialIdentity): Promise<Array<SocialAddress<ChainId>>>
}

export interface NameServiceState<ChainId> {
    ready: boolean
    readyPromise: Promise<void>

    /** get address of domain name */
    lookup?: (domain: string) => Promise<string | undefined>
    /** get domain name of address */
    reverse?: (address: string) => Promise<string | undefined>
}

export interface TokenState<ChainId, SchemaType> {
    ready: boolean
    readyPromise: Promise<void>

    /** The user trusted fungible tokens. */
    trustedFungibleTokens?: Subscription<Array<FungibleToken<ChainId, SchemaType>>>
    /** The user trusted non-fungible tokens. */
    trustedNonFungibleTokens?: Subscription<Array<NonFungibleToken<ChainId, SchemaType>>>
    /** The user blocked fungible tokens. */
    blockedFungibleTokens?: Subscription<Array<FungibleToken<ChainId, SchemaType>>>
    /** The user blocked non-fungible tokens. */
    blockedNonFungibleTokens?: Subscription<Array<NonFungibleToken<ChainId, SchemaType>>>
    /** Credible fungible tokens */
    credibleFungibleTokens?: Subscription<Array<FungibleToken<ChainId, SchemaType>>>
    /** Credible non-fungible tokens */
    credibleNonFungibleTokens?: Subscription<Array<NonFungibleToken<ChainId, SchemaType>>>

    /** Add a token */
    addToken?: (address: string, token: Token<ChainId, SchemaType>) => Promise<void>
    /** Remove a token */
    removeToken?: (address: string, token: Token<ChainId, SchemaType>) => Promise<void>
    /** Unblock a token */
    trustToken?: (address: string, token: Token<ChainId, SchemaType>) => Promise<void>
    /** Block a token */
    blockToken?: (address: string, token: Token<ChainId, SchemaType>) => Promise<void>
    /** Create a credible fungible token */
    createFungibleToken?: (
        chainId: ChainId,
        address: string,
        token?: FungibleToken<ChainId, SchemaType>,
    ) => Promise<FungibleToken<ChainId, SchemaType> | undefined>
    /** Create a credible non-fungible token */
    createNonFungibleToken?: (
        chainId: ChainId,
        address: string,
        token?: NonFungibleToken<ChainId, SchemaType>,
    ) => Promise<NonFungibleToken<ChainId, SchemaType> | undefined>
}
export interface TransactionState<ChainId, Transaction> {
    ready: boolean
    readyPromise: Promise<void>

    /** The tracked transactions of currently chosen sub-network */
    transactions?: Subscription<Array<RecentTransaction<ChainId, Transaction>>>

    /** Get a transaction record. */
    getTransaction?: (chainId: ChainId, address: string, id: string) => Promise<Transaction | undefined>
    /** Add a transaction record. */
    addTransaction?: (chainId: ChainId, address: string, id: string, transaction: Transaction) => Promise<void>
    /** Replace a transaction with new record. */
    replaceTransaction?: (
        chainId: ChainId,
        address: string,
        id: string,
        newId: string,
        transaction: Transaction,
    ) => Promise<void>
    /** Update transaction status. */
    updateTransaction?: (
        chainId: ChainId,
        address: string,
        id: string,
        status: Exclude<TransactionStatusType, TransactionStatusType.NOT_DEPEND>,
    ) => Promise<void>
    /** Remove a transaction record. */
    removeTransaction?: (chainId: ChainId, address: string, id: string) => Promise<void>
    /** Get all transaction records. */
    getTransactions?: (chainId: ChainId, address: string) => Promise<Array<RecentTransaction<ChainId, Transaction>>>
    /** Clear all transactions of the account under given chain */
    clearTransactions?: (chainId: ChainId, address: string) => Promise<void>
}
export interface TransactionFormatterState<ChainId, Parameters, Transaction> {
    /** Step 1: Create a transaction formatting context. */
    createContext: (chainId: ChainId, transaction: Transaction) => Promise<TransactionContext<ChainId, Parameters>>
    /** Step 2: Create a transaction descriptor */
    createDescriptor: (
        chainId: ChainId,
        transaction: Transaction,
        context: TransactionContext<ChainId, Parameters>,
    ) => Promise<TransactionDescriptor<ChainId, Transaction, Parameters>>
    /** Elaborate a transaction in a human-readable format. */
    formatTransaction: (
        chainId: ChainId,
        transaction: Transaction,
        txHash?: string,
    ) => Promise<TransactionDescriptor<ChainId, Transaction, Parameters>>
}
export interface TransactionWatcherState<ChainId, Transaction> {
    ready: boolean
    readyPromise: Promise<void>

    emitter: Emitter<WatchEvents<ChainId, Transaction>>

    /** Add a transaction into the watch list. */
    watchTransaction: (chainId: ChainId, id: string, transaction: Transaction) => Promise<void>
    /** Remove a transaction from the watch list. */
    unwatchTransaction: (chainId: ChainId, id: string) => Promise<void>
    /** Notify error */
    notifyError: (error: Error, request: JsonRpcPayload) => Promise<void>
    /** Notify transaction status */
    notifyTransaction: (
        chainId: ChainId,
        id: string,
        transaction: Transaction,
        status: TransactionStatusType,
    ) => Promise<void>
}
export interface ProviderState<ChainId, ProviderType, NetworkType> {
    ready: boolean
    readyPromise: Promise<void>

    /** The account of the currently visiting site. */
    account?: Subscription<string>
    /** The chain id of the currently visiting site. */
    chainId?: Subscription<ChainId>
    /** The network type of the currently visiting site. */
    networkType?: Subscription<NetworkType>
    /** The provider type of the currently visiting site. */
    providerType?: Subscription<ProviderType>

    setup(): Promise<void>

    /** Detect if a provider is ready */
    isReady: (providerType: ProviderType) => boolean
    /** Wait until a provider ready */
    untilReady: (providerType: ProviderType) => Promise<void>

    /** Connect with the provider and set chain id. */
    connect: (
        providerType: ProviderType,
        chainId: ChainId,
        account?: string,
        owner?: {
            account: string
            identifier?: ECKeyIdentifier
        },
        silent?: boolean,
    ) => Promise<Account<ChainId>>
    /** Disconnect with the provider. */
    disconnect: (providerType: ProviderType) => Promise<void>
}
export interface ConnectionState<
    ChainId,
    AddressType,
    SchemaType,
    ProviderType,
    Signature,
    Block,
    Operation,
    Transaction,
    TransactionReceipt,
    TransactionDetailed,
    TransactionSignature,
    Web3,
    Web3Provider,
    Web3ConnectionOptions = ConnectionOptions<ChainId, ProviderType, Transaction>,
    Web3Connection = Connection<
        ChainId,
        AddressType,
        SchemaType,
        ProviderType,
        Signature,
        Block,
        Operation,
        Transaction,
        TransactionReceipt,
        TransactionDetailed,
        TransactionSignature,
        Web3,
        Web3Provider
    >,
> {
    /** Get web3 SDK */
    getWeb3?: (initial?: Web3ConnectionOptions) => Web3
    /** Get web3 provider instance */
    getWeb3Provider?: (initial?: Web3ConnectionOptions) => Web3Provider
    /** Get connection */
    getConnection?: (initial?: Web3ConnectionOptions) => Web3Connection
}
export interface OthersState<ChainId, SchemaType, ProviderType, NetworkType, Transaction> {
    // #region resolvers
    chainResolver: ReturnChainResolver<ChainId, SchemaType, NetworkType>
    explorerResolver: ReturnExplorerResolver<ChainId, SchemaType, NetworkType>
    providerResolver: ReturnProviderResolver<ChainId, ProviderType>
    networkResolver: ReturnNetworkResolver<ChainId, NetworkType>
    // #endregion

    // #region validators
    isValidChain(chainId?: ChainId, testnet?: boolean): boolean
    isValidChainId(chainId: ChainId): boolean
    isValidDomain(domain?: string): boolean
    isValidAddress(address?: string): boolean
    isZeroAddress(address?: string): boolean
    isNativeTokenAddress(address?: string): boolean
    isNativeTokenSchemaType(schema?: SchemaType): boolean
    isFungibleTokenSchemaType(schema?: SchemaType): boolean
    isNonFungibleTokenSchemaType(schema?: SchemaType): boolean
    // #endregion

    // #region data formatting
    formatAddress(address: string, size?: number): string
    formatDomainName(domain?: string, size?: number): string
    formatSchemaType(schema: SchemaType): string
    formatTokenId(id?: string, size?: number): string
    // #endregion

    // #region customization
    getDefaultChainId(): ChainId
    getInvalidChainId(): ChainId
    getDefaultNetworkType(): NetworkType
    getDefaultProviderType(): ProviderType
    getZeroAddress(): string | undefined
    getNativeTokenAddress(chainId?: ChainId): string | undefined
    getMaskTokenAddress(chainId?: ChainId): string | undefined
    getAverageBlockDelay(chainId?: ChainId, scale?: number): number
    getTransactionSignature(chainId?: ChainId, transaction?: Partial<Transaction>): string | undefined

    // #region Constructor
    createNativeToken(chainId: ChainId): FungibleToken<ChainId, SchemaType>
    createFungibleToken(
        chainId: ChainId,
        schema: SchemaType,
        address: string,
        name?: string,
        symbol?: string,
        decimals?: number,
        logoURI?: string,
    ): FungibleToken<ChainId, SchemaType>
    createNonFungibleToken(
        chainId: ChainId,
        address: string,
        schema: SchemaType,
        tokenId: string,
        ownerId?: string,
        metadata?: NonFungibleToken<ChainId, SchemaType>['metadata'],
        contract?: NonFungibleToken<ChainId, SchemaType>['contract'],
        collection?: NonFungibleToken<ChainId, SchemaType>['collection'],
    ): NonFungibleToken<ChainId, SchemaType>
}

export interface BalanceNotifierState<ChainId> {
    emitter: Emitter<BalanceEvent<ChainId>>
}

export interface BlockNumberNotifierState<ChainId> {
    emitter: Emitter<BlockNumberEvent<ChainId>>
}

export interface Web3State<
    ChainId,
    AddressType,
    SchemaType,
    ProviderType,
    NetworkType,
    Signature,
    GasOption,
    Block,
    Operation,
    Transaction,
    TransactionReceipt,
    TransactionDetailed,
    TransactionSignature,
    TransactionParameter,
    Web3,
    Web3Provider,
> {
    AddressBook?: AddressBookState<ChainId>
    BalanceNotifier?: BalanceNotifierState<ChainId>
    BlockNumberNotifier?: BlockNumberNotifierState<ChainId>
    Hub?: HubState<ChainId, SchemaType, GasOption>
    IdentityService?: IdentityServiceState<ChainId>
    NameService?: NameServiceState<ChainId>
    RiskWarning?: RiskWarningState
    Settings?: SettingsState
    Token?: TokenState<ChainId, SchemaType>
    Transaction?: TransactionState<ChainId, Transaction>
    TransactionFormatter?: TransactionFormatterState<ChainId, TransactionParameter, Transaction>
    TransactionWatcher?: TransactionWatcherState<ChainId, Transaction>
    Connection?: ConnectionState<
        ChainId,
        AddressType,
        SchemaType,
        ProviderType,
        Signature,
        Block,
        Operation,
        Transaction,
        TransactionReceipt,
        TransactionDetailed,
        TransactionSignature,
        Web3,
        Web3Provider
    >
    Provider?: ProviderState<ChainId, ProviderType, NetworkType>
    Others?: OthersState<ChainId, SchemaType, ProviderType, NetworkType, Transaction>
    Storage?: Web3StorageServiceState
}

export interface NetworkIconClickBaitProps<ChainId, ProviderType, NetworkType> {
    network: NetworkDescriptor<ChainId, NetworkType>
    provider?: ProviderDescriptor<ChainId, ProviderType>
    children?: React.ReactNode
    onClick?: (
        network: NetworkDescriptor<ChainId, NetworkType>,
        provider?: ProviderDescriptor<ChainId, ProviderType>,
    ) => void
}

export interface ProviderIconClickBaitProps<ChainId, ProviderType, NetworkType> {
    provider: ProviderDescriptor<ChainId, ProviderType>
    children?: React.ReactNode
    onClick?: (
        network: NetworkDescriptor<ChainId, NetworkType>,
        provider: ProviderDescriptor<ChainId, ProviderType>,
    ) => void
}

export interface AddressFormatterProps {
    address: string
    size?: number
}

export interface Web3UI<ChainId, ProviderType, NetworkType> {
    SelectNetworkMenu?: {
        /** This UI will receive network icon as children component, and the plugin may hook click handle on it. */
        NetworkIconClickBait?: React.ComponentType<NetworkIconClickBaitProps<ChainId, ProviderType, NetworkType>>
    }
    SelectProviderDialog?: {
        /** This UI will receive network icon as children component, and the plugin may hook click handle on it. */
        NetworkIconClickBait?: React.ComponentType<NetworkIconClickBaitProps<ChainId, ProviderType, NetworkType>>
        /** This UI will receive provider icon as children component, and the plugin may hook click handle on it. */
        ProviderIconClickBait?: React.ComponentType<ProviderIconClickBaitProps<ChainId, ProviderType, NetworkType>>
    }
}
