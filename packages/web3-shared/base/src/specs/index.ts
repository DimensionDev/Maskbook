import type { ComponentType, ReactNode } from 'react'
import type { Subscription } from 'use-subscription'
import type { JsonRpcPayload } from 'web3-core-helpers'
import type { Emitter } from '@servie/events'
import type {
    ECKeyIdentifier,
    EnhanceableSite,
    ExtensionSite,
    NetworkPluginID,
    BindingProof,
    Account,
    Color,
    SocialAddress,
    SocialIdentity,
    SocialAccount,
    Startable,
} from '@masknet/shared-base'

export enum CurrencyType {
    NATIVE = 'native',
    BTC = 'btc',
    ETH = 'eth',
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

export enum TransactionStateType {
    FAILED = 0,
    SUCCEED = 1,
    NOT_DEPEND = 2,
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
    isDim: boolean
}

export interface Identity {
    address?: string
    nickname?: string
    avatarURL?: string
    link?: string
}

export type Price = Partial<Record<CurrencyType, string>>

export interface Contact {
    name: string
    address: string
}

export interface ChainDescriptor<ChainId, SchemaType, NetworkType> {
    ID: string
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
    rpcUrl: string
    iconUrl?: string
    // EIP3091
    explorerUrl: {
        url: string
        parameters?: Record<string, string | number | boolean>
    }
    features?: string[]
    // Indicate a built-in chain or customized one.
    isCustomized: boolean
}

export type Network<ChainId, SchemaType, NetworkType> = ChainDescriptor<ChainId, SchemaType, NetworkType>

export type ReasonableNetwork<ChainId, SchemaType, NetworkType> = ChainDescriptor<ChainId, SchemaType, NetworkType> & {
    createdAt: Date
    updatedAt: Date
}

export type TransferableNetwork<ChainId, SchemaType, NetworkType> = Omit<
    Network<ChainId, SchemaType, NetworkType>,
    'ID'
>

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
    icon: string
    /** The network icon in fixed color */
    iconColor: Color
    /** The average time for mining a block (unit: seconds). */
    averageBlockDelay: number
    /** The background gradient color for relative network bar */
    backgroundGradient?: string
    /** The network name. e.g. Ethereum */
    name: string
    /** The network short name. e.g. 'ETH' */
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
    icon: string
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
    symbol?: string | null
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
    market_cap?: string
    highest_price?: string
    volume_24h?: string
    average_price_24h?: string
    average_price_change_1d?: string
    average_price_change?: string
    average_price_change_7d?: string
    sales_24h?: number
    owners_total?: number
    total_volume?: string
    items_total?: number
    sales?: number
    volume?: number
    average_price?: string
}

export interface NonFungibleTokenActivity<ChainId, SchemaType> {
    hash: string
    event_type: ActivityType
    transaction_link: string
    timestamp: number
    imageURL: string
    trade_price?: number
    // The param `from` of the transaction
    from: string
    // The param `to` of the transaction
    to: string
    // The user address who received the NFT
    receive: string
    // The user address who sent the NFT
    send: string
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
    logo: ReactNode | undefined
    /** allowance token amount of this spender */
    amount?: number
    /** allowance token amount(not formatted by token decimals) of this spender */
    rawAmount?: number
}

/**
 * Authorization about a non-fungible contract.
 */
export interface NonFungibleContractSpender<ChainId, SchemaType> {
    amount: string
    contract: Pick<NonFungibleTokenContract<ChainId, SchemaType>, 'name' | 'address'>
    address: string
    name: string | undefined
    logo: ReactNode | undefined
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

type TransactionAsset<ChainId, SchemaType> = Token<ChainId, SchemaType> & {
    name: string
    symbol: string
    amount: string
    direction: string
}

export interface Transaction<ChainId, SchemaType> {
    id: string
    chainId: ChainId
    type?: LiteralUnion<'burn' | 'contract interaction'>
    cateType?: LiteralUnion<'approve' | 'receive' | 'send'>
    cateName?: string
    /** address */
    from: string
    /** address */
    to: string
    /** unix timestamp */
    timestamp: number
    /** 0: failed 1: succeed */
    status?: 0 | 1
    /** transferred assets */
    assets: Array<TransactionAsset<ChainId, SchemaType>>
    /** estimated tx fee */
    fee?: Price
    input?: string
    hash?: string
    methodId?: string
    blockNumber?: number
    isScam?: boolean
    nonce?: number
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

export interface SettingsState extends Startable {
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

export interface AddressBookState extends Startable {
    /** The tracked addresses of currently chosen sub-network */
    contacts?: Subscription<Contact[]>

    /** Add a contact into address book. */
    addContact: (contact: Contact) => Promise<void>
    /** Remove a contact from address book. */
    removeContact: (address: string) => Promise<void>
    /** Rename an name of contact from address book. */
    renameContact: (contact: Contact) => Promise<void>
}

export interface NetworkState<ChainId, SchemaType, NetworkType> extends Startable {
    /** The id of the used network. */
    networkID?: Subscription<string>
    /** All available networks. */
    networks?: Subscription<Array<ReasonableNetwork<ChainId, SchemaType, NetworkType>>>

    /** Add a new network. */
    addNetwork: (descriptor: TransferableNetwork<ChainId, SchemaType, NetworkType>) => Promise<void>
    /** Use the network RPC to build a connection. */
    useNetwork: (id: string) => Promise<void>
    /** Update a network. */
    updateNetwork: (
        id: string,
        updates: Partial<TransferableNetwork<ChainId, SchemaType, NetworkType>>,
    ) => Promise<void>
    /** Remove a network */
    removeNetwork: (id: string) => Promise<void>
}

export interface RiskWarningState extends Startable {
    /** Is approved */
    approved?: Subscription<boolean>

    /** Detect if an account is approved the statement */
    isApproved?: (address: string) => Promise<boolean>
    /** Approve statement of designate account */
    approve?: (address: string, pluginID?: string) => Promise<void>
    /** Revoke statement of designate account */
    revoke?: (address: string, pluginID?: string) => Promise<void>
}

export interface IdentityServiceState<ChainId> {
    /** Merge many social addresses into a social account. Don't overwrite it in sub-classes. */
    __mergeSocialAddressesAll__(socialAddresses: Array<SocialAddress<ChainId>>): Array<SocialAccount<ChainId>>
    /** Find all social addresses related to the given identity. */
    lookup(identity: SocialIdentity): Promise<Array<SocialAddress<ChainId>>>
}

export interface NameServiceState extends Startable {
    /** get address of domain name */
    lookup?: (domain: string) => Promise<string | undefined>
    /** get domain name of address */
    reverse?: (address: string) => Promise<string | undefined>
}

export interface TokenState<ChainId, SchemaType> extends Startable {
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
    nonFungibleCollectionMap?: Subscription<
        Record<
            string,
            Array<{
                contract: NonFungibleTokenContract<ChainId, SchemaType>
                tokenIds: string[]
            }>
        >
    >
    addNonFungibleCollection?(
        owner: string,
        contract: NonFungibleTokenContract<ChainId, SchemaType>,
        tokenIds: string[],
    ): Promise<void>
}
export interface TransactionState<ChainId, Transaction> extends Startable {
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
export interface TransactionWatcherState<ChainId, Transaction> extends Startable {
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
export interface ProviderState<ChainId, ProviderType, NetworkType> extends Startable {
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

export interface BalanceNotifierState<ChainId> {
    emitter: Emitter<BalanceEvent<ChainId>>
}

export interface BlockNumberNotifierState<ChainId> {
    emitter: Emitter<BlockNumberEvent<ChainId>>
}

export interface Web3State<ChainId, SchemaType, ProviderType, NetworkType, Transaction, TransactionParameter> {
    AddressBook?: AddressBookState
    Network?: NetworkState<ChainId, SchemaType, NetworkType>
    BalanceNotifier?: BalanceNotifierState<ChainId>
    BlockNumberNotifier?: BlockNumberNotifierState<ChainId>
    IdentityService?: IdentityServiceState<ChainId>
    NameService?: NameServiceState
    RiskWarning?: RiskWarningState
    Settings?: SettingsState
    Token?: TokenState<ChainId, SchemaType>
    Transaction?: TransactionState<ChainId, Transaction>
    TransactionFormatter?: TransactionFormatterState<ChainId, TransactionParameter, Transaction>
    TransactionWatcher?: TransactionWatcherState<ChainId, Transaction>
    Provider?: ProviderState<ChainId, ProviderType, NetworkType>
}

export interface NetworkIconClickBaitProps<ChainId, ProviderType, NetworkType> {
    network: NetworkDescriptor<ChainId, NetworkType>
    provider?: ProviderDescriptor<ChainId, ProviderType>
    children?: ReactNode
    onClick?: (
        network: NetworkDescriptor<ChainId, NetworkType>,
        provider?: ProviderDescriptor<ChainId, ProviderType>,
    ) => void
}

export interface ProviderIconClickBaitProps<ChainId, ProviderType, NetworkType> {
    provider: ProviderDescriptor<ChainId, ProviderType>
    children?: ReactNode
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
        NetworkIconClickBait?: ComponentType<NetworkIconClickBaitProps<ChainId, ProviderType, NetworkType>>
    }
    SelectProviderDialog?: {
        /** This UI will receive network icon as children component, and the plugin may hook click handle on it. */
        NetworkIconClickBait?: ComponentType<NetworkIconClickBaitProps<ChainId, ProviderType, NetworkType>>
        /** This UI will receive provider icon as children component, and the plugin may hook click handle on it. */
        ProviderIconClickBait?: ComponentType<ProviderIconClickBaitProps<ChainId, ProviderType, NetworkType>>
    }
}
