import type { ReactNode } from 'react'
import type { Subscription } from 'use-subscription'
import type { Emitter } from '@servie/events'
import type {
    EnhanceableSite,
    ExtensionSite,
    NetworkPluginID,
    Account,
    Color,
    SocialAddress,
    SocialIdentity,
    SocialAccount,
    Web3BioProfile,
} from '@masknet/shared-base'
import type { JsonRpcRequest } from '../types/JsonRpc.js'

export enum CurrencyType {
    NATIVE = 'native',
    BTC = 'btc',
    ETH = 'eth',
    USD = 'usd',
    CNY = 'cny',
    HKD = 'hkd',
    JPY = 'jpy',
    EUR = 'eur',
}

export enum OrderSide {
    Buy = 0,
    Sell = 1,
}

export enum GasOptionType {
    FAST = 'fast',
    NORMAL = 'normal',
    SLOW = 'slow',
    CUSTOM = 'custom',
}

export enum TokenType {
    Fungible = 'Fungible',
    NonFungible = 'NonFungible',
}

export interface NonFungibleToken<ChainId, SchemaType> extends Token<ChainId, SchemaType> {
    name?: string
    symbol?: string
    logoURL?: string
    metadata?: NonFungibleTokenMetadata
}

export interface NonFungibleTokenMetadata {
    description?: string
    mediaURL?: string
    animationURL?: string
    externalLink?: string
    traits?: Array<{ trait_type: string; value: string; display_type?: string }>
}

export interface NonFungibleCollection<ChainId, SchemaType> {
    id: string
    chainId: ChainId
    name: string
    symbol?: string
    address: string
    logoURL?: string
    description?: string
    totalSupply?: number
    ownerCount?: number
}

export interface NonFungibleTokenContract<ChainId, SchemaType> {
    chainId: ChainId
    address: string
    name: string
    symbol?: string
    logoURL?: string
    schema: SchemaType
}

export interface NonFungibleTokenRarity<ChainId> {
    provider: SourceType
    rank?: number
    score?: number
    total?: number
    traits?: Record<string, { value: string; percentage: number }>
}

export interface NonFungibleTokenTrait {
    trait_type: string
    value: string
    display_type?: string
    percentage?: number
}

export interface NonFungibleTokenAuction<ChainId, SchemaType> {
    provider: SourceType
    token?: FungibleToken<ChainId, SchemaType>
    startPrice?: string
    endPrice?: string
    startTime?: number
    endTime?: number
}

export interface NonFungibleTokenOrder<ChainId, SchemaType> {
    provider: SourceType
    token?: FungibleToken<ChainId, SchemaType>
    price?: string
    expirationTime?: number
    maker?: string
    taker?: string
}

export interface NonFungibleTokenEvent<ChainId, SchemaType> {
    type: string
    from?: string
    to?: string
    price?: string
    token?: FungibleToken<ChainId, SchemaType>
    timestamp?: number
}

export interface SocialLinks {
    twitter?: string
    discord?: string
    website?: string
    telegram?: string
    instagram?: string
    medium?: string
    github?: string
}

export enum SourceType {
    // FT assets
    DeBank = 'DeBank',
    Zerion = 'Zerion',
    Chainbase = 'Chainbase',
    Flow = 'Flow',
    Solana = 'Solana',
    CoinGecko = 'CoinGecko',
    UniswapInfo = 'UniswapInfo',
    CF = 'CloudFlare',
    GoPlus = 'GoPlus',

    // Token List
    R2D2 = 'R2D2',
    Rabby = 'Rabby',

    Approval = 'Approval',
}

export enum SearchResultType {
    // e.g., 0x6a7122B831c2B79c508A978f73f2ee23171279B3
    EOA = 'EOA',
    // e.g., vitalik.eth or vitalik.bnb
    Domain = 'Domain',
    // e.g., $MASK #MASK or its address 0x69af81e73a73b40adf4f3d4223cd9b1ece623074
    FungibleToken = 'FungibleToken',
    // NFT token search results
    NonFungibleToken = 'NonFungibleToken',
    // NFT collection search results
    NonFungibleCollection = 'NonFungibleCollection',
    // e.g., masknetwork
    CollectionListByTwitterHandle = 'CollectionListByTwitterHandle',
    // e.g., PancakeSwap
    DAO = 'DAO',
}

export enum MessageStateType {
    NOT_DEPEND = 1,
    APPROVED = 2,
    DENIED = 3,
}

export enum TransactionStatusType {
    NOT_DEPEND = 1,
    SUCCEED = 2,
    FAILED = 3,
}

export enum TransactionReceiptStatusType {
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
    coinMarketCapChainId?: string
    coinGeckoChainId?: string
    coinGeckoPlatformId?: string
    name: string
    color?: string
    fullName?: string
    shortName?: string
    /** For Solana, it's the cluster. The mainnet would be 'mainnet-beta' */
    network: LiteralUnion<'mainnet' | 'testnet'>
    nativeCurrency: FungibleToken<ChainId, SchemaType>
    minGasLimit?: string
    maxGasLimit?: string
    defaultGasLimit?: string
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

export type ReasonableNetwork<ChainId, SchemaType, NetworkType> = ChainDescriptor<ChainId, SchemaType, NetworkType> & {
    createdAt: Date
    updatedAt: Date
}

export type TransferableNetwork<ChainId, SchemaType, NetworkType> = Omit<
    ChainDescriptor<ChainId, SchemaType, NetworkType>,
    'ID'
>

export interface MessageDescriptor<Request, Response> {
    ID: string
    state: MessageStateType
    /** The origin of this request (if this request is from third party URL) */
    origin: string | undefined
    request: Request
    response?: Response
}

export type ReasonableMessage<Request, Response> = MessageDescriptor<Request, Response> & {
    createdAt: Date
    updatedAt: Date
}

export type TransferableMessage<Request, Response> = Omit<MessageDescriptor<Request, Response>, 'ID'>

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
    /** For NFT, it could be `${chainId}.${contractAddress}.${tokenId}` */
    id: string
    chainId: ChainId
    type: TokenType
    schema: SchemaType
    address: string
    /** It's newly added, keep it optional until all code is migrated */
    runtime?: NetworkPluginID
    /** NFT has tokenId */
    tokenId?: string
    /** Added by user */
    isCustomToken?: boolean
}

export interface FungibleToken<ChainId, SchemaType> extends Token<ChainId, SchemaType> {
    name: string
    symbol: string
    decimals: number
    logoURL?: string
    // Sorted by market cap.
    rank?: number
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
    tokenInfo: Pick<FungibleToken<ChainId, SchemaType>, 'address' | 'logoURL' | 'symbol' | 'name'> & {
        decimals?: number
    }
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
    /**
     * Join name with underscore and will be used for hash tag or currency tag.
     * e.g., 'Bitcoin Puppets' => 'Bitcoin_Puppets', will be used to match `#Bitcoin_Puppets` or `$Bitcoin_Puppets`
     */
    name_underscore?: string
    /**
     * Remove space in name and will be used for hash tag or currency tag.
     * e.g., 'Bitcoin Puppets' => 'BitcoinPuppets', will be used to match `#BitcoinPuppets` or `$BitcoinPuppets`
     */
    name_connect?: string
}

export interface EOAResult<ChainId> extends Result<ChainId> {
    type: SearchResultType.EOA
    domain?: string
    web3bioProfiles?: Web3BioProfile[]
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
    relatedTwitters?: string[]
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
    type: SearchResultType.CollectionListByTwitterHandle
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

export interface FormattedTransaction<ChainId, Parameter = string | undefined> {
    chainId: ChainId
    /** a transaction title. */
    title: FormattedTransactionTitle
    context?: TransactionContext<ChainId, Parameter>
    /** The address of the token leveraged to swap other tokens */
    tokenInAddress?: string
    /** The amount of the token leveraged to swap other tokens */
    tokenInAmount?: string
    /** a human-readable description. */
    description?: FormattedTransactionDescription
    snackbar?: FormattedTransactionSnackbar
    popup?: TransactionDescriptorPopup
}
export type FormattedTransactionTitle =
    // General
    | 'Cancel Transaction'
    | 'Contract Deployment'
    | 'Contract Interaction'
    | 'Revoke Token'
    | 'Transfer NFT'
    | 'Transfer Token'
    | 'Unlock Token'
    | 'Unlock NFT Contract'
    | { key: '{data}'; data: string }
    | { key: '{action} NFT contract'; action: string }
    // Airdrop
    | 'Claim your Airdrop'
    // Lens
    | 'Follow User'
    // Gitcoin
    | 'Donate'
    // RedPacket
    | 'Claim Lucky Drop'
    | 'Create Lucky Drop'
    | 'Refund Lucky drop'
    // Savings
    | 'Deposit token'
    | 'Withdraw token'
    // SmartPay
    | 'Create Smart Pay wallet'
    | 'Deploy Smarty Pay wallet'
    | 'Change Owner'
    | 'Swap'
export type FormattedTransactionDescription =
    // General
    | 'Revoke the approval for token'
    | 'Transaction submitted.'
    | 'Unlock token'
    | 'Swap completed successfully.'
    | { key: '{data}'; data: string }
    | { key: '{action} {symbol} NFT contract.'; action: string; symbol: string }
    | { key: 'Contract Deployment {token}'; token: string }
    | { key: 'Revoke the approval for {symbol}.'; symbol: string }
    | { key: 'Send {token}'; token: string }
    | { key: 'Transfer {symbol} NFT.'; symbol: string }
    | { key: 'Unlock {symbol}.'; symbol: string }
    | { key: 'Unlock {symbol} NFT contract.'; symbol: string }
    // Airdrop
    | 'Transaction submitted.'
    // RedPacket
    | 'Claim your Lucky Drop.'
    | 'Create your Lucky Drop.'
    | 'Refund your expired Lucky Drop.'
    // Savings
    | { key: 'Deposit {token} for savings.'; token: string }
    | { key: 'Withdraw {token} for savings.'; token: string }
export interface TransactionDescriptor<ChainId, Transaction, Parameter = string | undefined>
    extends FormattedTransaction<ChainId, Parameter> {
    /** The transaction type */
    type: TransactionDescriptorType
    /** The original transaction object */
    _tx: Transaction
}
export interface FormattedTransactionSnackbar {
    /** a human-readable title for successful transaction. */
    successfulTitle?: FormattedTransactionSnackbarSuccessTitle
    /** a human-readable description for successful transaction. */
    successfulDescription?: FormattedTransactionSnackbarSuccessDescription
    /** a human-readable description for failed transaction. */
    failedDescription?: FormattedTransactionSnackbarFailedDescription
}
export type FormattedTransactionSnackbarSuccessTitle = 'Unlock Token'
export type FormattedTransactionSnackbarSuccessDescription =
    // General
    | 'The token approval revoked.'
    | 'Token unlocked'
    | 'Swap completed successfully.'
    | { key: '{symbol} NFT transferred.'; symbol: string }
    | { key: '{action} {symbol} approval successfully.'; action: string; symbol: string }
    | { key: '{action} {symbol} NFT contract successfully.'; action: string; symbol: string }
    | { key: '{symbol} NFT contract unlocked.'; symbol: string }
    | { key: '{symbol} unlocked'; symbol: string }
    | { key: '{token} sent.'; token: string }
    | {
          key: "You've approved {token} for {spender}. If you want to revoke this token, please set spending cap amount to 0."
          token: string
          spender: string
      }
    | {
          key: "You didn't approve {symbol}. Please do not set spending cap to 0 and try it again."
          symbol: string
      }
    | { key: '{token} sent.'; token: string }
    // Airdrop
    | { key: '{token} were claimed'; token: string }
    // Gitcoin
    | { key: 'You have donated {amount} {symbol}'; amount: string; symbol: string }
    // Lucky Drop
    | 'Lucky Drop claimed.'
    | 'Lucky Drop refunded.'
    | { key: 'Lucky Drop with {token} refunded.'; token: string }
    | { key: 'Lucky Drop with {token} claimed.'; token: string }
    | { key: 'Lucky drop with {token} created.'; token: string }
    // Savings
    | { key: '{token} withdrawn.'; token: string }
    | { key: '{token} deposited.'; token: string }
    // SmartPay
    | 'Created a SmartPay wallet on Polygon network.'
    | 'Deploy a SmartPay wallet on Polygon network.'
    | 'Owner changed.'
export type FormattedTransactionSnackbarFailedDescription =
    // General
    | ''
    | 'Failed to revoke token contract.'
    | 'Failed to send token.'
    | 'Failed to transfer NFT.'
    | 'Failed to unlock NFT contract.'
    | 'Failed to unlock token contract.'
    | 'Transaction failed'
    | 'Failed to swap'
    | 'Transaction has been rejected!'
    | { key: 'Failed to {action} NFT contract.'; action: string }
    // Lucky Drop
    | 'Failed to claim Lucky Drop.'
    | 'Failed to create Lucky Drop.'
    | 'Failed to refund Lucky Drop.'
    // Savings
    | 'Failed to deposit token.'
    | { key: 'Failed to deposit {symbol}.'; symbol: string }
    | { key: 'Failed to withdraw {symbol}.'; symbol: string }

export interface TransactionDescriptorPopup {
    /** The spender address of erc20 approve */
    spender?: string
    /** The spender address of erc721 approve */
    erc721Spender?: string
    /** The method name of contract function */
    method?: string
    /** The Non-Fungible token description */
    tokenId?: string
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
        parameters?: Record<string, unknown>
    }>
    /** nested children contexts */
    children?: Array<TransactionContext<ChainId, Parameter>>
}

export type TransactionAsset<ChainId, SchemaType> = Token<ChainId, SchemaType> & {
    name: string
    symbol: string
    amount: string
    direction: LiteralUnion<'send' | 'receive' | 'self'>
    sender?: string
    recipient?: string
}

export interface Transaction<ChainId, SchemaType> {
    id: string
    chainId: ChainId
    type?:
        | LiteralUnion<'burn' | 'contract interaction' | 'transfer'>
        // Zerion operation types
        | LiteralUnion<
              'approve' | 'burn' | 'deploy' | 'deposit' | 'execute' | 'mint' | 'receive' | 'send' | 'trade' | 'withdraw'
          >
    cateType?: LiteralUnion<'approve' | 'receive' | 'send'>
    cateName?: string
    /** address */
    from: string
    /** address */
    to: string
    /** unix timestamp */
    timestamp: number
    status: TransactionStatusType
    /** transferred assets */
    assets: Array<TransactionAsset<ChainId, SchemaType>>
    approveAssets?: Array<TransactionAsset<ChainId, SchemaType>>
    /** estimated tx fee */
    fee?: Price
    feeInfo?: {
        name?: string
        symbol?: string
        /** url */
        icon?: string
        /** ui amount */
        amount: string
        /** price per token */
        price: number
        /** value in usd */
        value: number
    }
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
    /** record drafted at */
    draftedAt: Date
    /** record created at */
    createdAt: Date
    /** record updated at */
    updatedAt: Date
    type?: LiteralUnion<'burn' | 'contract interaction'>
}

export type RecentTransactionComputed<ChainId, Transaction> = RecentTransaction<ChainId, Transaction> & {
    /** a dynamically computed field in the hook which means the minted (initial) transaction */
    _tx: Transaction
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
    error: [RecognizableError, JsonRpcRequest]
    /** Emit when the watched transaction status updated. */
    progress: [ChainId, string, TransactionStatusType, Transaction | undefined]
}

export interface TransactionChecker<ChainId, Transaction> {
    getStatus(chainId: ChainId, id: string, transaction: Transaction): Promise<TransactionStatusType>
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
    /** Set the default fiat currency. */
    setDefaultCurrencyType: (type: CurrencyType) => Promise<void>
}

export interface AddressBookState {
    /** The tracked addresses of currently chosen sub-network */
    contacts?: Subscription<Contact[]>

    /** Add a contact into address book. */
    addContact: (contact: Contact) => Promise<void>
    /** Remove a contact from address book. */
    removeContact: (address: string) => Promise<void>
    /** Rename an name of contact from address book. */
    renameContact: (contact: Contact) => Promise<void>
}

export interface NetworkState<ChainId, SchemaType, NetworkType> {
    /** The id of the used network. */
    networkID?: Subscription<string>
    /** The used network. */
    network?: Subscription<ReasonableNetwork<ChainId, SchemaType, NetworkType>>
    /** All available networks. */
    networks?: Subscription<Array<ReasonableNetwork<ChainId, SchemaType, NetworkType>>>

    /** Add a new network. */
    addNetwork: (descriptor: TransferableNetwork<ChainId, SchemaType, NetworkType>) => Promise<void>
    /** Use the network RPC to build a connection. */
    switchNetwork: (id: string) => Promise<void>
    /** Update a network. */
    updateNetwork: (
        id: string,
        updates: Partial<TransferableNetwork<ChainId, SchemaType, NetworkType>>,
    ) => Promise<void>
    /** Remove a network */
    removeNetwork: (id: string) => Promise<void>
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

export interface IdentityServiceState<ChainId> {
    /** Merge many social addresses into a social account. Don't overwrite it in sub-classes. */
    mergeSocialAddressesAllDoNotOverride(socialAddresses: Array<SocialAddress<ChainId>>): Array<SocialAccount<ChainId>>
    /** Find all social addresses related to the given identity. */
    lookup(identity: SocialIdentity): Promise<Array<SocialAddress<ChainId>>>
}

export interface NameServiceState {
    /** get address of domain name */
    lookup?: (domain: string) => Promise<string | undefined>
    /** get domain name of address */
    reverse?: (address: string, domainOnly?: boolean) => Promise<string | undefined>
    /** safely get domain name of address */
    safeReverse?: (address: string, domainOnly?: boolean) => Promise<string | undefined>
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
    /** Credible fungible tokens */
    credibleFungibleTokens?: Subscription<Array<FungibleToken<ChainId, SchemaType>>>
    /** Credible non-fungible tokens */
    credibleNonFungibleTokens?: Subscription<Array<NonFungibleToken<ChainId, SchemaType>>>

    /** Add a token */
    addToken?: (address: string, token: Token<ChainId, SchemaType>) => Promise<void>
    /** Remove a token */
    removeToken?: (address: string, token: Token<ChainId, SchemaType>) => Promise<void>
    /** Unblock a token */
    trustToken?: (
        address: string,
        token: Token<ChainId, SchemaType> | NonFungibleToken<ChainId, SchemaType>,
    ) => Promise<void>
    /** Block a token */
    blockToken?: (
        address: string,
        token: Token<ChainId, SchemaType> | NonFungibleToken<ChainId, SchemaType>,
    ) => Promise<void>
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
    addNonFungibleTokens?(
        owner: string,
        contract: NonFungibleTokenContract<ChainId, SchemaType>,
        tokenIds: string[],
    ): Promise<void>
    removeNonFungibleTokens?(
        owner: string,
        contract: NonFungibleTokenContract<ChainId, SchemaType>,
        tokenIds: string[],
    ): Promise<void>
}

export interface MessageState<Request, Response> {
    /** All unresolved requests. */
    messages: Subscription<Array<ReasonableMessage<Request, Response>>>
    /** Updates a request. */
    updateMessage(id: string, updates: Partial<TransferableMessage<Request, Response>>): Promise<void>
    /** Create a request and waits for approval from the user. */
    createRequestAndWaitForApproval(
        message: TransferableMessage<Request, Response>,
    ): Promise<ReasonableMessage<Request, Response>>
    /** Approve a request and send it to the network (usually transactions). */
    approveAndSendRequest(id: string, updates?: Request): Promise<Response | void>
    /** Approve and resolve a request with the given result. */
    approveRequestWithResult(id: string, result: Response): Promise<void>
    /** Reject a request. */
    rejectRequest(id: string): Promise<void>
    /** Reject requests. */
    rejectRequests(options: DenyRequestOptions): Promise<void>
}

/** If you set both value */
export interface DenyRequestOptions {
    /** Set to true if you want to keep all requests that not related to a specific chain. e.g. `wallet_requestPermissions` or `personal_sign` */
    keepChainUnrelated: boolean
    /** Set to true if you want to keep all requests that not related to the current nonce (basically means all transactions) */
    keepNonceUnrelated: boolean
}

export interface TransactionState<ChainId, Transaction> {
    /** The tracked transactions of currently chosen sub-network */
    transactions?: Subscription<Array<RecentTransaction<ChainId, Transaction>>>

    /** Get a transaction record. */
    getTransaction?: (chainId: ChainId, address: string, id: string) => Promise<Transaction | undefined>
    /** Add a transaction record. */
    addTransaction?: (
        chainId: ChainId,
        address: string,
        id: string,
        transaction: Transaction & { draftedAt: Date },
    ) => Promise<void>
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
    start(): void
    emitter: Emitter<WatchEvents<ChainId, Transaction>>

    /** Notify error */
    notifyError: (error: Error, request: JsonRpcRequest) => Promise<void>
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
    untilReady: (providerType: ProviderType) => undefined | Promise<void>

    /** Connect with the provider and set chain id. */
    connect: (
        providerType: ProviderType,
        chainId: ChainId,
        account?: string,
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

export interface Web3State<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter,
> {
    AddressBook?: AddressBookState
    Network?: NetworkState<ChainId, SchemaType, NetworkType>
    BalanceNotifier?: BalanceNotifierState<ChainId>
    BlockNumberNotifier?: BlockNumberNotifierState<ChainId>
    IdentityService?: IdentityServiceState<ChainId>
    NameService?: NameServiceState
    /** @deprecated */
    RiskWarning?: RiskWarningState
    Message?: MessageState<MessageRequest, MessageResponse>
    Settings?: SettingsState
    Token?: TokenState<ChainId, SchemaType>
    Transaction?: TransactionState<ChainId, Transaction>
    TransactionFormatter?: TransactionFormatterState<ChainId, TransactionParameter, Transaction>
    TransactionWatcher?: TransactionWatcherState<ChainId, Transaction>
    Provider?: ProviderState<ChainId, ProviderType, NetworkType>
}
