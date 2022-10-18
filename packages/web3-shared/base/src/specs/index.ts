import type { Subscription } from 'use-subscription'
import type { JsonRpcPayload } from 'web3-core-helpers'
import type { Emitter } from '@servie/events'
import type {
    EnhanceableSite,
    ExtensionSite,
    ProfileIdentifier,
    ECKeyIdentifier,
    NextIDPersonaBindings,
    NextIDPlatform,
    NameServiceID,
    NetworkPluginID
} from '@masknet/shared-base'
import type { api } from '@dimensiondev/mask-wallet-core/proto'
import type {
    ReturnChainResolver,
    ReturnExplorerResolver,
    ReturnNetworkResolver,
    ReturnProviderResolver,
} from '../utils/index.js'

export interface Pageable<Item, Indicator = unknown> {
    /** the indicator of the current page */
    indicator: Indicator
    /** the indicator of the next page */
    nextIndicator?: Indicator
    /** items data */
    data: Item[]
}

export type Color =
    | `rgb(${number}, ${number}, ${number})`
    | `rgba(${number}, ${number}, ${number}, ${number})`
    | `#${string}${string}${string}${string}${string}${string}`
    | `#${string}${string}${string}`
    | `hsl(${number}, ${number}%, ${number}%)`

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

    // Rarity
    RaritySniper = 'RaritySniper',
    TraitSniper = 'TraitSniper',

    // Token List
    R2D2 = 'R2D2',
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

export enum SocialAddressType {
    ADDRESS = 'ADDRESS',
    ENS = 'ENS',
    RSS3 = 'RSS3',
    SOL = 'SOL',
    KV = 'KV',
    NEXT_ID = 'NEXT_ID',
    CyberConnect = 'CyberConnect',
    Leaderboard = '.eth Leaderboard',
    Sybil = 'Sybil',
}

export enum StorageProviderType {
    NextID = 'NextID',
    // RSS3 File API
    RSS3 = 'RSS3',
    // KV storage powered by CloudFlare
    KV = 'kv',
}

export interface Identity {
    address?: string
    nickname?: string
    avatarURL?: string
    link?: string
}

export interface SocialIdentity {
    /** The identifier of the social account */
    identifier?: ProfileIdentifier
    /** The avatar image link of the social account */
    avatar?: string
    /** The bio content of the social account */
    bio?: string
    /** The nickname of the social account */
    nickname?: string
    /** The homepage link of the social account */
    homepage?: string
    /** Has a NextID binding or not */
    hasBinding?: boolean
    /** The public key of persona in hex */
    publicKey?: string
    /** Is own user account identity */
    isOwner?: boolean
    /** All bindings of the persona  **/
    binding?: NextIDPersonaBindings
}

export interface SocialAddress<PluginID> {
    /** The ID of a plugin that the address belongs to */
    pluginID: PluginID
    /** The data source type */
    type: SocialAddressType
    /** The address in hex string */
    address: string
    /** A human readable address title */
    label: string
}

export interface SocialAccount extends Omit<SocialAddress<NetworkPluginID>, 'type'> {
    supportedAddressTypes?: SocialAddressType[]
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
    logoURL?: string
    iconURL?: string
    creatorEarning?: string
    /** source type */
    source?: SourceType
}

export interface NonFungibleTokenMetadata<ChainId> {
    chainId: ChainId
    /** Might be the format `TheName #42` */
    name: string
    symbol?: string
    description?: string
    /** preview image url */
    imageURL?: string
    /** source media url */
    mediaURL?: string
    /** source media type */
    mediaType?: string
    /** project url */
    projectURL?: string
    /** source type */
    source?: SourceType
}

export interface NonFungibleCollection<ChainId, SchemaType> {
    chainId: ChainId
    name: string
    slug: string
    symbol?: string
    description?: string
    address?: string
    schema?: SchemaType
    iconURL?: string | null
    /** the amount of mint tokens */
    tokensTotal?: number
    /** the amount of holders */
    ownersTotal?: number
    /** verified by provider */
    verified?: boolean
    /** unix timestamp */
    createdAt?: number
    /** source type */
    source?: SourceType
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

export enum ActivityType {
    Transfer = 'Transfer',
    Mint = 'Mint',
    Sale = 'Sale',
    Offer = 'Offer',
    List = 'List',
    CancelOffer= 'CancelOffer',
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

export interface TransactionDescriptor<ChainId, Transaction> {
    chainId: ChainId
    /** The transaction type */
    type: TransactionDescriptorType
    /** a transaction title. */
    title: string
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
        /** a human-readable description for failed transaction. */
        failedDescription?: string
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

export interface Wallet {
    id: string
    /** User define wallet name. Default address.prefix(6) */
    name: string
    /** The address of wallet */
    address: string
    /** true: Mask Wallet, false: External Wallet */
    hasStoredKeyInfo: boolean
    /** true: Derivable Wallet. false: UnDerivable Wallet */
    hasDerivationPath: boolean
    /** yep: removable, nope: unremovable */
    configurable?: boolean
    /** the derivation path when wallet was created */
    derivationPath?: string
    /** the derivation path when wallet last was derived */
    latestDerivationPath?: string
    /** the internal presentation of mask wallet sdk */
    storedKeyInfo?: api.IStoredKeyInfo
    /** the Mask SDK stored key info */
    /** record created at */
    createdAt: Date
    /** record updated at */
    updatedAt: Date
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

export interface Account<ChainId> {
    account: string
    chainId: ChainId
}

export interface BalanceEvent<ChainId> {
    /** Emit if the balance of the account updated. */
    update: [Account<ChainId>]
}

export interface BlockNumberEvent<ChainId> {
    /** Emit if the balance of the chain updated. */
    update: [ChainId]
}

export interface ProviderEvents<ChainId, ProviderType> {
    /** Emit when the chain id changed. */
    chainId: [string]
    /** Emit when the accounts changed. */
    accounts: [string[]]
    /** Emit when the site connects with a provider. */
    connect: [Account<ChainId>]
    /** Emit when the site disconnect with a provider. */
    disconnect: [ProviderType]
}

export interface WatchEvents<Transaction> {
    /** Emit when error occur */
    error: [Error, JsonRpcPayload]
    /** Emit when the watched transaction status updated. */
    progress: [string, TransactionStatusType, Transaction | undefined]
}

export interface WalletProvider<ChainId, ProviderType, Web3Provider, Web3> {
    emitter: Emitter<ProviderEvents<ChainId, ProviderType>>

    /** Get to know whether the provider is ready. */
    readonly ready: boolean
    /** Keep waiting until the provider is ready. */
    readonly readyPromise: Promise<void>
    /** Switch to the designate chain. */
    switchChain(chainId?: ChainId): Promise<void>
    /** Create an instance from the network SDK. */
    createWeb3(options?: ProviderOptions<ChainId>): Promise<Web3>
    /** Create an instance that implement the wallet protocol. */
    createWeb3Provider(options?: ProviderOptions<ChainId>): Promise<Web3Provider>
    /** Create the connection. */
    connect(chainId?: ChainId): Promise<Account<ChainId>>
    /** Dismiss the connection. */
    disconnect(): Promise<void>
}

export interface ProviderOptions<ChainId> {
    chainId: ChainId
    account?: string
}

export interface TransactionChecker<ChainId, Transaction> {
    getStatus(chainId: ChainId, id: string, transaction: Transaction): Promise<TransactionStatusType>
}

export interface ConnectionOptions<ChainId, ProviderType, Transaction> {
    /** Designate the signer of the transaction. */
    account?: string
    /** Designate the sub-network id of the transaction. */
    chainId?: ChainId
    /** Designate the provider to handle the transaction. */
    providerType?: ProviderType
    /** Fragments to merge into the transaction. */
    overrides?: Partial<Transaction>
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
    getWeb3(initial?: Web3ConnectionOptions): Promise<Web3>
    /** Get web3 provider instance */
    getWeb3Provider(initial?: Web3ConnectionOptions): Promise<Web3Provider>
    /** Get gas price */
    getGasPrice(initial?: Web3ConnectionOptions): Promise<string>
    /** Get address type of given address. */
    getAddressType(address: string, initial?: Web3ConnectionOptions): Promise<AddressType | undefined>
    /** Get schema type of given token address. */
    getSchemaType(address: string, initial?: Web3ConnectionOptions): Promise<SchemaType | undefined>
    /** Get a native fungible token. */
    getNativeToken(initial?: Web3ConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>>
    /** Get a fungible token. */
    getFungibleToken(address: string, initial?: Web3ConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>>
    /** Get a non-fungible token. */
    getNonFungibleToken(
        address: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: Web3ConnectionOptions,
    ): Promise<NonFungibleToken<ChainId, SchemaType>>
    getNonFungibleTokenOwner(
        address: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: Web3ConnectionOptions,
    ): Promise<string>
    getNonFungibleTokenOwnership(
        address: string,
        tokenId: string,
        owner: string,
        schema?: SchemaType,
        initial?: Web3ConnectionOptions,
    ): Promise<boolean>
    getNonFungibleTokenMetadata(
        address: string,
        tokenId: string,
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
    /** Get native fungible token balance. */
    getNativeTokenBalance(initial?: Web3ConnectionOptions): Promise<string>
    /** Get fungible token balance. */
    getFungibleTokenBalance(address: string, initial?: Web3ConnectionOptions): Promise<string>
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
    /** Get the currently connected account. */
    getAccount(initial?: Web3ConnectionOptions): Promise<string>
    /** Get the currently chain id. */
    getChainId(initial?: Web3ConnectionOptions): Promise<ChainId>
    /** Get the latest block by number. */
    getBlock(no: number, initial?: Web3ConnectionOptions): Promise<Block | null>
    /** Get the latest block number. */
    getBlockNumber(initial?: Web3ConnectionOptions): Promise<number>
    /** Get the latest block unix timestamp. */
    getBlockTimestamp(initial?: Web3ConnectionOptions): Promise<number>
    /** Get the latest balance of the account. */
    getBalance(address: string, initial?: Web3ConnectionOptions): Promise<string>
    /** Get the detailed of transaction by id. */
    getTransaction(id: string, initial?: Web3ConnectionOptions): Promise<TransactionDetailed | null>
    /** Get the latest transaction status. */
    getTransactionStatus(id: string, initial?: Web3ConnectionOptions): Promise<TransactionStatusType>
    /** Get the latest transaction nonce. */
    getTransactionNonce(address: string, initial?: Web3ConnectionOptions): Promise<number>
    /** Get the transaction receipt. */
    getTransactionReceipt(id: string, initial?: Web3ConnectionOptions): Promise<TransactionReceipt | null>
    /** Get the source code of a on-chain program. */
    getCode(address: string, initial?: Web3ConnectionOptions): Promise<string>
    /** Switch to sub network */
    switchChain?: (chainId: ChainId, initial?: Web3ConnectionOptions) => Promise<void>
    /** Sign message */
    signMessage(dataToSign: string, signType?: string, initial?: Web3ConnectionOptions): Promise<Signature>
    /** Verify message */
    verifyMessage(
        dataToVerify: string,
        signature: Signature,
        signType?: string,
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
    /** Call a operation */
    callOperation?: (operation: Operation, initial?: Web3ConnectionOptions) => Promise<string>
    /** Send a operation */
    sendOperation?: (operation: Operation, initial?: Web3ConnectionOptions) => Promise<TransactionSignature>
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
    /** Replace transaction */
    requestTransaction(hash: string, config: Transaction, initial?: Web3ConnectionOptions): Promise<void>
    /** Cancel transaction */
    cancelTransaction(hash: string, config: Transaction, initial?: Web3ConnectionOptions): Promise<void>
}

export interface HubIndicator {
    /** The id of the page. */
    id: string
    /** The index number of the page. */
    index: number
}

export interface HubOptions<ChainId, Indicator = HubIndicator> {
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
}

export interface HubFungible<ChainId, SchemaType, GasOption, Web3HubOptions = HubOptions<ChainId>> {
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
}

export interface HubNonFungible<ChainId, SchemaType, GasOption, Web3HubOptions = HubOptions<ChainId>> {
    /** Get non-fungible assets of the given collection. */
    getNonFungibleAssetsByCollection?: (
        address: string,
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
    /** Get non-fungible tokens search by the give keyword. */
    getNonFungibleCollectionsByKeyword?: (
        keyword: string,
        initial?: Web3HubOptions,
    ) => Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>>>
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
    getGasOptions?: (chainId: ChainId, initial?: Web3HubOptions) => Promise<Record<GasOptionType, GasOption>>
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
    /** The tracked addresses of currently chosen sub-network */
    addressBook?: Subscription<string[]>

    /** Add an address into address book. */
    addAddress: (chainId: ChainId, address: string) => Promise<void>
    /** Remove an address from address book. */
    removeAddress: (chainId: ChainId, address: string) => Promise<void>
}
export interface RiskWarningState {
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
    getHub?: (options: Web3HubOptions) => Promise<Web3Hub>
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
}

export interface IdentityServiceState {
    /** Find all social addresses related to the given identity. */
    lookup(identity: SocialIdentity): Promise<Array<SocialAddress<NetworkPluginID>>>
}

export interface NameServiceResolver {
    get id(): NameServiceID
    /** get address of domain name */
    lookup?: (domain: string) => Promise<string | undefined>
    /** get domain name of address */
    reverse?: (address: string) => Promise<string | undefined>
}

export interface NameServiceState<ChainId> {
    /** create name resolver */
    createResolvers: (chainId: ChainId) => NameServiceResolver[]
    /** get address of domain name */
    lookup?: (chainId: ChainId, domain: string) => Promise<string | undefined>
    /** get domain name of address */
    reverse?: (chainId: ChainId, address: string) => Promise<string | undefined>
}
export interface TokenState<ChainId, SchemaType> {
    /** The user trusted fungible tokens. */
    trustedFungibleTokens?: Subscription<Array<FungibleToken<ChainId, SchemaType>>>
    /** The user trusted non-fungible tokens. */
    trustedNonFungibleTokens?: Subscription<Array<NonFungibleToken<ChainId, SchemaType>>>
    /** The user blocked fungible tokens. */
    blockedFungibleTokens?: Subscription<Array<FungibleToken<ChainId, SchemaType>>>
    /** The user blocked non-fungible tokens. */
    blockedNonFungibleTokens?: Subscription<Array<NonFungibleToken<ChainId, SchemaType>>>

    /** Add a token */
    addToken?: (address: string, token: Token<ChainId, SchemaType>) => Promise<void>
    /** Remove a token */
    removeToken?: (address: string, token: Token<ChainId, SchemaType>) => Promise<void>
    /** Unblock a token */
    trustToken?: (address: string, token: Token<ChainId, SchemaType>) => Promise<void>
    /** Block a token */
    blockToken?: (address: string, token: Token<ChainId, SchemaType>) => Promise<void>
}
export interface TransactionState<ChainId, Transaction> {
    /** The tracked transactions of currently chosen sub-network */
    transactions?: Subscription<Array<RecentTransaction<ChainId, Transaction>>>

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
    ) => Promise<TransactionDescriptor<ChainId, Transaction>>
    /** Elaborate a transaction in a human-readable format. */
    formatTransaction: (
        chainId: ChainId,
        transaction: Transaction,
        txHash?: string,
    ) => Promise<TransactionDescriptor<ChainId, Transaction>>
}
export interface TransactionWatcherState<ChainId, Transaction> {
    emitter: Emitter<WatchEvents<Transaction>>

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
    /** The account of the currently visiting site. */
    account?: Subscription<string>
    /** The chain id of the currently visiting site. */
    chainId?: Subscription<ChainId>
    /** The network type of the currently visiting site. */
    networkType?: Subscription<NetworkType>
    /** The provider type of the currently visiting site. */
    providerType?: Subscription<ProviderType>

    /** Detect if a provider is ready */
    isReady: (providerType: ProviderType) => boolean
    /** Wait until a provider ready */
    untilReady: (providerType: ProviderType) => Promise<void>
    /** Connect with the provider and set chain id. */
    connect: (chainId: ChainId, providerType: ProviderType) => Promise<Account<ChainId>>
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
        Web3Provider,
        Web3ConnectionOptions
    >,
> {
    /** Get web3 SDK */
    getWeb3?: (initial?: Web3ConnectionOptions) => Promise<Web3>
    /** Get web3 provider instance */
    getWeb3Provider?: (initial?: Web3ConnectionOptions) => Promise<Web3Provider>
    /** Get connection */
    getConnection?: (initial?: Web3ConnectionOptions) => Promise<Web3Connection>
}
export interface WalletState {
    /** The currently stored wallet by MaskWallet. */
    wallets?: Subscription<Wallet[]>
    /** The default derivable wallet. */
    walletPrimary?: Subscription<Wallet | null>

    addWallet?: (id: string, wallet: Wallet) => Promise<void>
    removeWallet?: (id: string) => Promise<void>
    getAllWallets?: () => Promise<Wallet[]>
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
    isValidDomain(domain?: string): boolean
    isValidAddress(address?: string): boolean
    isZeroAddress(address?: string): boolean
    isNativeTokenAddress(address?: string): boolean
    isNativeTokenSchemaType(schemaType?: SchemaType): boolean
    isFungibleTokenSchemaType(schemaType?: SchemaType): boolean
    isNonFungibleTokenSchemaType(schemaType?: SchemaType): boolean
    // #endregion

    // #region data formatting
    formatAddress(address: string, size?: number): string
    formatDomainName(domain?: string, size?: number): string
    formatSchemaType(schemaType: SchemaType): string
    formatTokenId(id?: string, size?: number): string
    // #endregion

    // #region customization
    getDefaultChainId(): ChainId
    getDefaultNetworkType(): NetworkType
    getDefaultProviderType(): ProviderType
    getZeroAddress(): string | undefined
    getNativeTokenAddress(chainId?: ChainId): string | undefined
    getMaskTokenAddress(chainId?: ChainId): string | undefined
    getAverageBlockDelay(chainId?: ChainId, scale?: number): number
    getTransactionSignature(chainId?: ChainId, transaction?: Partial<Transaction>): string | undefined
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
        Web3Provider
    > {
        AddressBook?: AddressBookState<ChainId>
        BalanceNotifier?: BalanceNotifierState<ChainId>
        BlockNumberNotifier?: BlockNumberNotifierState<ChainId>
        Hub?: HubState<ChainId, SchemaType, GasOption>
        IdentityService?: IdentityServiceState
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
        Wallet?: WalletState
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
    network: NetworkDescriptor<ChainId, NetworkType>
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
        NetworkIconClickBait?: React.ComponentType<
            NetworkIconClickBaitProps<ChainId, ProviderType, NetworkType>
        >
    }
    SelectProviderDialog?: {
        /** This UI will receive network icon as children component, and the plugin may hook click handle on it. */
        NetworkIconClickBait?: React.ComponentType<
            NetworkIconClickBaitProps<ChainId, ProviderType, NetworkType>
        >
        /** This UI will receive provider icon as children component, and the plugin may hook click handle on it. */
        ProviderIconClickBait?: React.ComponentType<
            ProviderIconClickBaitProps<ChainId, ProviderType, NetworkType>
        >
    }
}
