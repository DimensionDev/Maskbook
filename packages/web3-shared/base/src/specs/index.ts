import type { Subscription } from 'use-subscription'
import type { Emitter } from '@servie/events'
import type { EnhanceableSite, ExtensionSite, ProfileIdentifier } from '@masknet/shared-base'
import type { api } from '@dimensiondev/mask-wallet-core/proto'
import type {
    ReturnChainResolver,
    ReturnExplorerResolver,
    ReturnNetworkResolver,
    ReturnProviderResolver,
} from '../utils'

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

export enum NetworkPluginID {
    PLUGIN_EVM = 'com.mask.evm',
    PLUGIN_FLOW = 'com.mask.flow',
    PLUGIN_SOLANA = 'com.mask.solana',
}

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

    // NFT assets
    RSS3 = 'RSS3',
    Zora = 'zora',
    OpenSea = 'opensea',
    Rarible = 'rarible',
    LooksRare = 'looksrare',
    NFTScan = 'NFTScan',
    Alchemy_EVM = 'Alchemy_EVM',
    Alchemy_FLOW = 'Alchemy_FLOW',
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
    RETRY = 'retry', // speed up
}

export enum SocialAddressType {
    ADDRESS = 'ADDRESS',
    ENS = 'ENS',
    UNS = 'UNS',
    DNS = 'DNS',
    RSS3 = 'RSS3',
    KV = 'KV',
    GUN = 'GUN',
    THE_GRAPH = 'THE_GRAPH',
    TWITTER_BLUE = 'TWITTER_BLUE',
    NEXT_ID = 'NEXT_ID',
    SOL = 'SOL',
}

export interface Identity {
    address?: string
    nickname?: string
    avatarURL?: string
    link?: string
}

export interface SocialIdentity {
    identifier?: ProfileIdentifier
    avatar?: string
    bio?: string
    nickname?: string
    homepage?: string
}

export interface SocialAddress<PluginID> {
    /** The ID of a plugin that the address belongs to */
    networkSupporterPluginID: PluginID
    /** The data source type */
    type: SocialAddressType
    /** The address in hex string */
    address: string
    /** A human readable address title */
    label: string
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
    /** The ID of a plugin that provides the functionality of this network. */
    networkSupporterPluginID: NetworkPluginID
    /** The chain id */
    chainId: ChainId
    /** The network type */
    type: NetworkType
    /** The network icon */
    icon: URL
    /** The network icon in fixed color */
    iconColor: Color
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
    /** A link to download the client */
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

export interface NonFungibleTokenContract<ChainId, SchemaType> {
    chainId: ChainId
    name: string
    symbol: string
    address: string
    schema: SchemaType
    owner?: string
    logoURL?: string
    iconURL?: string
}

export interface NonFungibleTokenMetadata<ChainId> {
    chainId: ChainId
    /** Might be the format `TheName #42` */
    name: string
    symbol: string
    description?: string
    /** preview image url */
    imageURL?: string
    /** source media url */
    mediaURL?: string
    /** source media type */
    mediaType?: string
}

export interface NonFungibleTokenCollection<ChainId> {
    chainId: ChainId
    name: string
    slug: string
    address?: string
    symbol?: string
    schema_name?: string
    balance?: number
    description?: string
    iconURL?: string
    /** verified by provider */
    verified?: boolean
    /** unix timestamp */
    createdAt?: number
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
    collection?: NonFungibleTokenCollection<ChainId>
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
    /** current price */
    price?: Price
    paymentToken?: FungibleToken<ChainId, SchemaType>
}

export interface NonFungibleTokenEvent<ChainId, SchemaType> {
    id: string
    /** chain Id */
    chainId: ChainId
    /** token type */
    type: string
    /** permalink of asset */
    assetPermalink?: string
    /** symbol of asset */
    assetSymbol?: string
    /** token amount */
    quantity: string
    /** transaction hash */
    hash?: string
    /** the account make the order */
    from: Identity
    /** the account fullfil the order */
    to: Identity
    /** unix timestamp */
    timestamp: number
    /** relate token price */
    price?: Price
    paymentToken?: FungibleToken<ChainId, SchemaType>
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
    /** traits of the digital asset */
    traits?: NonFungibleTokenTrait[]
    /** token on auction */
    auction?: NonFungibleTokenAuction<ChainId, SchemaType>
    orders?: Array<NonFungibleTokenOrder<ChainId, SchemaType>>
    events?: Array<NonFungibleTokenEvent<ChainId, SchemaType>>
    paymentTokens?: Array<FungibleToken<ChainId, SchemaType>>
    priceInToken?:PriceInToken<ChainId, SchemaType>
}

/**
 * Authorization about a fungible token.
 */
export interface FungibleTokenSpenderAuthorization<ChainId, SchemaType> {
    tokenInfo:  Pick<FungibleToken<ChainId, SchemaType>, 'address' | 'logoURL' | 'symbol' | 'name'>
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
 export interface NonFungibleContractSpenderAuthorization<ChainId, SchemaType> {
    amount: string
    contract: Pick<NonFungibleTokenContract<ChainId, SchemaType>, 'name' | 'address'>
    address: string
    name: string | undefined
    logo: React.ReactNode | undefined
}

/**
 * The security diagnosis about a fungible token.
 */
export interface FungibleTokenSecurity {
    // TODO:
    // security items
}

/**
 * The security diagnosis about a non-fungible token.
 */
export interface NonFungibleTokenSecurity {
    // TODO:
    // security items
}

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
    /** a human-readable description. */
    description?: string
    /** a human-readable description for successful transaction. */
    successfulDescription?: string
    /** The original transaction object */
    _tx: Transaction
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
    type?: string
    filterType?: string
    from: string
    to: string
    /** unix timestamp */
    timestamp: number
    /** 0: failed 1: succeed */
    status: 0 | 1
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
    error: [Error]
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
    /** Designate the sub-network id of the transaction. */
    chainId?: ChainId
    /** Designate the signer of the transaction. */
    account?: string
    /** Designate the provider to handle the transaction. */
    providerType?: ProviderType
    /** Fragments to merge into the transaction. */
    overrides?: Partial<Transaction>
}
export interface Connection<
    ChainId,
    SchemaType,
    ProviderType,
    Signature,
    Block,
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
    /** Get schema type of given token address. */
    getTokenSchema(address: string, initial?: Web3ConnectionOptions): Promise<SchemaType | undefined>
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
    ): Promise<NonFungibleTokenCollection<ChainId>>
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
        recipient: string,
        tokenId: string,
        amount: string,
        schema?: SchemaType,
        initial?: Web3ConnectionOptions,
    ): Promise<string>
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

export interface Hub<ChainId, SchemaType, GasOption, Web3HubOptions = HubOptions<ChainId>> {
    /** Get recommended gas options. */
    getGasOptions?: (chainId: ChainId, initial?: Web3HubOptions) => Promise<Record<GasOptionType, GasOption>>
    /** Get the most recent transactions of the given account. */
    getTransactions: (
        chainId: ChainId,
        account: string,
        initial?: Web3HubOptions,
    ) => Promise<Array<Transaction<ChainId, SchemaType>>>
    /** Get non-fungible tokens of the given collection. */
    getNonFungibleTokensByCollection?: (
        address: string,
        initial?: Web3HubOptions,
    ) => Promise<Pageable<NonFungibleToken<ChainId, SchemaType>>>
    /** Get non-fungible assets of the given collection. */
    getNonFungibleAssetsByCollection?: (
        address: string,
        initial?: Web3HubOptions,
    ) => Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>>
    /** Get a non-fungible contract. */
    getNonFungibleTokenContract?: (
        address: string,
        initial?: Web3HubOptions,
    ) => Promise<NonFungibleTokenContract<ChainId, SchemaType>>
    /** Get balance of a fungible token owned by the given account. */
    getFungibleTokenBalance?: (address: string, initial?: Web3HubOptions) => Promise<number>
    /** Get balance of non-fungible tokens in a collection owned by the given account. */
    getNonFungibleTokenBalance?: (address: string, initial?: Web3HubOptions) => Promise<number>
    /** Get security diagnosis about a fungible token. */
    getFungibleTokenSecurity?: (
        chainId: ChainId,
        address: string,
        initial?: Web3HubOptions,
    ) => Promise<FungibleTokenSecurity>
    /** Get security diagnosis about a non-fungible token. */
    getNonFungibleTokenSecurity?: (
        chainId: ChainId,
        address: string,
        initial?: Web3HubOptions,
    ) => Promise<NonFungibleTokenSecurity>
    /** Get fungible tokens from built-in token list. */
    getFungibleTokensFromTokenList?: (
        chainId: ChainId,
        initial?: Web3HubOptions,
    ) => Promise<Array<FungibleToken<ChainId, SchemaType>>>
    /** Get non-fungible tokens from built-in token list. */
    getNonFungibleTokensFromTokenList?: (
        chainId: ChainId,
        initial?: Web3HubOptions,
    ) => Promise<Array<NonFungibleToken<ChainId, SchemaType>>>
    /** Get price of a fungible token. */
    getFungibleTokenPrice?: (chainId: ChainId, address: string, initial?: Web3HubOptions) => Promise<number>
    /** Get price of a non-fungible token. */
    getNonFungibleTokenPrice?: (
        chainId: ChainId,
        address: string,
        tokenId: string,
        initial?: Web3HubOptions,
    ) => Promise<number>
    /** Get token icon URLs that point to a fungible token. */
    getFungibleTokenIconURLs?: (chainId: ChainId, address: string, initial?: Web3HubOptions) => Promise<string[]>
    /** Get token icon URLs that point to a non-fungible token. */
    getNonFungibleTokenIconURLs?: (
        chainId: ChainId,
        address: string,
        tokenId?: string,
        initial?: Web3HubOptions,
    ) => Promise<string[]>
    /** Get spenders of a fungible token approved by the given account. */
    getApprovedFungibleTokenSpenders?: (
        chainId: ChainId,
        account: string,
        initial?: Web3HubOptions,
    ) => Promise<Array<FungibleTokenSpenderAuthorization<ChainId, SchemaType>>>
    /** Get contracts of a non-fungible token approved by the given account. */
    getApprovedNonFungibleContracts?: (
        chainId: ChainId,
        account: string,
        initial?: Web3HubOptions,
    ) => Promise<Array<NonFungibleContractSpenderAuthorization<ChainId, SchemaType>>>
    /** Get a fungible asset. */
    getFungibleAsset?: (
        address: string,
        initial?: Web3HubOptions,
    ) => Promise<FungibleAsset<ChainId, SchemaType> | undefined>
    /** Get a non-fungible asset. */
    getNonFungibleAsset?: (
        address: string,
        tokenId: string,
        initial?: Web3HubOptions,
    ) => Promise<NonFungibleAsset<ChainId, SchemaType> | undefined>
    /** Get fungible assets owned by the given account. */
    getFungibleAssets?: (
        account: string,
        initial?: Web3HubOptions,
    ) => Promise<Pageable<FungibleAsset<ChainId, SchemaType>>>
    /** Get non-fungible assets owned by the given account. */
    getNonFungibleAssets?: (
        account: string,
        initial?: Web3HubOptions,
    ) => Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>>
    /** Get a fungible token. */
    getFungibleToken?: (
        address: string,
        initial?: Web3HubOptions,
    ) => Promise<FungibleToken<ChainId, SchemaType> | undefined>
    /** Get a non-fungible token. */
    getNonFungibleToken?: (
        address: string,
        tokenId: string,
        initial?: Web3HubOptions,
    ) => Promise<NonFungibleToken<ChainId, SchemaType> | undefined>
    /** Get fungible tokens owned by the given account. */
    getFungibleTokens?: (
        account: string,
        initial?: Web3HubOptions,
    ) => Promise<Pageable<FungibleToken<ChainId, SchemaType> | Error>>
    /** Get non-fungible tokens owned by the given account. */
    getNonFungibleTokens?: (
        account: string,
        initial?: Web3HubOptions,
    ) => Promise<Pageable<NonFungibleToken<ChainId, SchemaType>>>
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
    getNonFungibleCollections?: (
        account: string,
        initial?: Web3HubOptions,
    ) => Promise<Pageable<NonFungibleTokenCollection<ChainId>>>

    /** Place a bid on a token. */
    createBuyOrder?: (/** TODO: add parameters */) => Promise<void>
    /** List a token for public sell. */
    createSellOrder?: (/** TODO: add parameters */) => Promise<void>
    /** Fulfill an order. */
    fulfillOrder?: (/** TODO: add parameters */) => Promise<void>
    /** Cancel an order. */
    cancelOrder?: (/** TODO: add parameters */) => Promise<void>
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

export interface IdentityServiceState {
    /** Find all social addresses related to the given identity. */
    lookup(identity: SocialIdentity, includes?: SocialAddressType[]): Promise<Array<SocialAddress<NetworkPluginID>>>
}
export interface NameServiceState<ChainId> {
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
    addToken?: (token: Token<ChainId, SchemaType>) => Promise<void>
    /** Remove a token */
    removeToken?: (token: Token<ChainId, SchemaType>) => Promise<void>
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
    ) => Promise<TransactionDescriptor<ChainId, Transaction>>
}
export interface TransactionWatcherState<ChainId, Transaction> {
    emitter: Emitter<WatchEvents<Transaction>>

    /** Add a transaction into the watch list. */
    watchTransaction: (chainId: ChainId, id: string, transaction: Transaction) => Promise<void>
    /** Remove a transaction from the watch list. */
    unwatchTransaction: (chainId: ChainId, id: string) => Promise<void>
    /** Notify error */
    notifyError: (error: Error) => Promise<void>
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
    SchemaType,
    ProviderType,
    Signature,
    Block,
    Transaction,
    TransactionReceipt,
    TransactionDetailed,
    TransactionSignature,
    Web3,
    Web3Provider,
    Web3ConnectionOptions = ConnectionOptions<ChainId, ProviderType, Transaction>,
    Web3Connection = Connection<
        ChainId,
        SchemaType,
        ProviderType,
        Signature,
        Block,
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
    isSameAddress(address?: string, otherAddress?: string): boolean
    // #endregion

    // #region data formatting
    formatAddress(address: string, size?: number): string
    formatDomainName(domain?: string, size?: number): string
    formatTokenId(id?: string, size?: number): string
    // #endregion

    // #region customization
    getDefaultChainId(): ChainId
    getDefaultNetworkType(): NetworkType
    getZeroAddress(chainId?: ChainId): string
    getNativeTokenAddress(chainId?: ChainId): string
    getMaskTokenAddress(chainId?: ChainId): string | undefined
    getAverageBlockDelay(chainId?: ChainId, scale?: number): number
    getTransactionSignature(chainId?: ChainId, transaction?: Partial<Transaction>): string | undefined
    // #endregion
}

export interface BalanceNotifierState<ChainId> {
    emitter: Emitter<BalanceEvent<ChainId>>
}

export interface BlockNumberNotifierState<ChainId> {
    emitter: Emitter<BlockNumberEvent<ChainId>>
}
