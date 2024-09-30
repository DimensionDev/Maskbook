import type { ReactNode } from 'react'
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
    SignType,
} from '@masknet/shared-base'

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
    CollectionListByTwitterHandle = 'CollectionListByTwitterHandle',
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
    /** some providers define id, while others don't. For those don't, we will fallback to contract address */
    id?: string
    chainId: ChainId
    name: string
    slug: string
    symbol?: string | null
    description?: string
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
    floorPrices?: Array<{
        marketplace_id: LiteralUnion<'blur' | 'looksrare' | 'opensea' | 'x2y2'>
        marketplace_name: LiteralUnion<'Blur' | 'LooksRare' | 'OpenSea' | 'X2Y2'>
        value: number
        payment_token: {
            payment_token_id: LiteralUnion<'ethereum.native'>
            name: string
            symbol: string
            address: string | null
            decimals: number
        }
    }>
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
    transaction_link?: string
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
    traits?: NonFungibleTokenTrait[]
}

export interface NonFungibleTokenTrait {
    /** The type of trait. */
    type: string
    /** The value of trait. */
    value: string
    /** The rarity of trait in percentage. */
    rarity?: string
    displayType?: LiteralUnion<'date' | 'string' | 'number'> | null
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
    // MaskBox
    | 'Purchase Maskbox NFT'
    // RedPacket
    | 'Claim Lucky Drop'
    | 'Claim NFT Lucky Drop'
    | 'Create Lucky Drop'
    | 'Create NFT Lucky Drop'
    | 'Refund Lucky drop'
    // Savings
    | 'Deposit token'
    | 'Withdraw token'
    // SmartPay
    | 'Create Smart Pay wallet'
    | 'Deploy Smarty Pay wallet'
    | 'Change Owner'
export type FormattedTransactionDescription =
    // General
    | 'Revoke the approval for token'
    | 'Transaction submitted.'
    | 'Unlock token'
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
    // MaskBox
    | 'Purchase Maskbox NFT.'
    // RedPacket
    | 'Claim your Lucky Drop.'
    | 'Claim your NFT Lucky Drop'
    | 'Create your Lucky Drop.'
    | 'Create your NFT Lucky Drop.'
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
    | 'Revoke the approval successfully.'
    | 'Unlock token successfully'
    | { key: 'Transfer {symbol} NFT successfully.'; symbol: string }
    | { key: '{action} {symbol} approval successfully.'; action: string; symbol: string }
    | { key: '{action} {symbol} NFT contract successfully.'; action: string; symbol: string }
    | { key: 'Unlock {symbol} NFT contract successfully.'; symbol: string }
    | { key: 'Unlock {symbol} successfully'; symbol: string }
    | { key: 'Send {token} successfully.'; token: string }
    | {
          key: "You've approved {token} for {spender}. If you want to revoke that token, please keep custom spending cap amount as 0 and try it again."
          token: string
          spender: string
      }
    | {
          key: "You didn't approve {symbol} successfully. Please do not set spending cap as 0 and try it again."
          symbol: string
      }
    | { key: 'Send {token} successfully.'; token: string }
    // Airdrop
    | { key: '{token} were successfully claimed'; token: string }
    // Gitcoin
    | { key: 'You have donated {amount} {symbol}'; amount: string; symbol: string }
    // Lucky Drop
    | 'Claim Lucky Drop successfully.'
    | 'Claim NFT Lucky Drop successfully.'
    | 'Create NFT Lucky Drop successfully.'
    | 'Refund Lucky Drop successfully.'
    | { key: 'Claim 1 {symbol} NFT Lucky Drop successfully.'; symbol: string }
    | { key: 'Create {symbol} NFT Lucky Drop successfully.'; symbol: string }
    | { key: 'Refund Lucky Drop with {token} successfully.'; token: string }
    | { key: 'Claim Lucky Drop with {token} successfully.'; token: string }
    | { key: 'Create Lucky drop with {token} successfully.'; token: string }
    // MaskBox
    | 'Purchase Maskbox NFT successfully.'
    | { key: 'Purchase Maskbox NFT with {token} successfully.'; token: string }
    // Savings
    | { key: 'Withdraw {token} successfully.'; token: string }
    | { key: 'Deposit {token} successfully.'; token: string }
    // SmartPay
    | 'Created a SmartPay wallet on Polygon network.'
    | 'Deploy a SmartPay wallet on Polygon network.'
    | 'Owner changed successfully.'
export type FormattedTransactionSnackbarFailedDescription =
    // General
    | ''
    | 'Failed to revoke token contract.'
    | 'Failed to send token.'
    | 'Failed to transfer NFT.'
    | 'Failed to unlock NFT contract.'
    | 'Failed to unlock token contract.'
    | 'Transaction failed'
    | 'Transaction was Rejected!'
    | { key: 'Failed to {action} NFT contract.'; action: string }
    // Lucky Drop
    | 'Failed to claim Lucky Drop.'
    | 'Failed to create Lucky Drop.'
    | 'Failed to refund Lucky Drop.'
    // Savings
    | 'Failed to deposit token.'
    | { key: 'Failed to deposit {symbol}.'; symbol: string }
    | { key: 'Failed to withdraw {symbol}.'; symbol: string }
    // MaskBox
    | 'Failed to purchase Maskbox NFT.'

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
        parameters?: {
            [key: string]: Parameter
        }
    }>
    /** nested children contexts */
    children?: Array<TransactionContext<ChainId, Parameter>>
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
    type?: LiteralUnion<'burn' | 'contract interaction' | 'transfer'>
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
    error: [RecognizableError, JsonRpcPayload]
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
    emitter: Emitter<WatchEvents<ChainId, Transaction>>

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
    untilReady: (providerType: ProviderType) => undefined | Promise<void>

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
    /** Sign a message with persona (w or w/o popups) */
    // TODO: this is not the best place to put this signature, but to avoid IOContext leaked as a global variable, we'll put it here for now.
    signWithPersona(type: SignType, message: unknown, identifier?: ECKeyIdentifier, silent?: boolean): Promise<string>
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
    RiskWarning?: RiskWarningState
    Message?: MessageState<MessageRequest, MessageResponse>
    Settings?: SettingsState
    Token?: TokenState<ChainId, SchemaType>
    Transaction?: TransactionState<ChainId, Transaction>
    TransactionFormatter?: TransactionFormatterState<ChainId, TransactionParameter, Transaction>
    TransactionWatcher?: TransactionWatcherState<ChainId, Transaction>
    Provider?: ProviderState<ChainId, ProviderType, NetworkType>
}
