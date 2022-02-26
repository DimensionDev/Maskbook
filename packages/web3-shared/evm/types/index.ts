import type { RequestArguments, TransactionConfig as TransactionConfig_ } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type { CurrencyType } from '@masknet/plugin-infra'
import type { NonPayableTransactionObject, PayableTransactionObject } from '@masknet/web3-contracts/types/types'
import type { EnhanceableSite, ExtensionSite } from '@masknet/shared-base'

export interface SendOverrides {
    chainId?: ChainId
    account?: string
}

export interface RequestOptions {
    site?: EnhanceableSite | ExtensionSite
    providerType?: ProviderType
    popupsWindow?: boolean
}

export interface ExternalProvider {
    request: <T>(requestArguments: RequestArguments) => Promise<T>
    send?: (
        payload: JsonRpcPayload,
        callback: (error: Error | null, response?: JsonRpcResponse | undefined) => void,
    ) => void
    sendAsync: (
        payload: JsonRpcPayload,
        callback: (error: Error | null, response?: JsonRpcResponse | undefined) => void,
    ) => void
}

export type ChainIdOptionalRecord<T> = { [k in ChainId]?: T }
export type ChainIdRecord<T> = { [k in ChainId]: T }

export type Primitive = string | number | boolean | symbol | undefined | null | bigint

export type Web3Constants = Record<string, { [K in ChainId]: Primitive | Primitive[] }>

// Learn more about ethereum ChainId https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
export enum ChainId {
    // Mainnet
    Mainnet = 1,
    Ropsten = 3,
    Rinkeby = 4,
    Gorli = 5,
    Kovan = 42,

    // BSC
    BSC = 56,
    BSCT = 97,

    // Matic
    Matic = 137,
    Mumbai = 80001,

    // Arbitrum
    Arbitrum = 42161,
    Arbitrum_Rinkeby = 421611,

    // xDai
    xDai = 100,

    // Avalanche
    Avalanche = 43114,
    Avalanche_Fuji = 43113,

    // Celo
    Celo = 42220,

    // Fantom
    Fantom = 250,

    // Aurora
    Aurora = 1313161554,
    Aurora_Testnet = 1313161555,

    // Fuse
    Fuse = 122,

    // Boba
    Boba = 288,

    // Metis
    Metis = 1088,

    // Optimistic
    Optimistic = 10,

    // Conflux
    Conflux = 1030,
}

/**
 * The wallet lock status
 */
export enum LockStatus {
    INIT = 0,
    UNLOCK = 1,
    LOCKED = 2,
}

export interface Wallet {
    /** User define wallet name. Default address.prefix(6) */
    name: string
    /** The address of wallet */
    address: string
    /** yep: removable, nope: unremovable */
    configurable: boolean
    /** yep: Mask Wallet, nope: External Wallet */
    hasStoredKeyInfo: boolean
    /** yep: Derivable Wallet. nope: UnDerivable Wallet */
    hasDerivationPath: boolean
}

// #region Ether
export interface NativeToken {
    type: EthereumTokenType.Native
    address: string
    chainId: ChainId
}

export interface NativeTokenDetailed extends NativeToken {
    name: string
    symbol: string
    decimals: number
    logoURI?: string
}
// #endregion

// #region ERC20
export interface ERC20Token {
    type: EthereumTokenType.ERC20
    address: string
    chainId: ChainId
}

export interface ERC20TokenDetailed extends ERC20Token {
    name?: string
    symbol?: string
    decimals: number
    logoURI?: string[]
}
// #endregion

// #region ERC721
export interface ERC721Token {
    type: EthereumTokenType.ERC721
    address: string
    chainId: ChainId
}

export interface ERC721ContractDetailed extends ERC721Token {
    name: string
    symbol: string
    baseURI?: string
    iconURL?: string
}

export interface ERC721TokenInfo {
    name?: string
    description?: string
    tokenURI?: string
    mediaUrl?: string
    imageURL?: string
    owner?: string
    // loading tokenURI
    hasTokenDetailed?: boolean
}

export interface ERC721TokenDetailed {
    tokenId: string
    info: ERC721TokenInfo
    contractDetailed: ERC721ContractDetailed
    collection?: {
        name: string
        image?: string
        slug: string
    }
}

export interface ERC721TokenRecordInDatabase extends ERC721TokenDetailed {
    record_id: string
}

export interface ERC721TokenCollectionInfo {
    name: string
    chainId?: ChainId
    iconURL?: string
    slug: string
    address: string
    addresses?: string[]
    symbol: string
    balance: number
}

// #endregion

// #region ERC1155
export interface ERC1155Token {
    type: EthereumTokenType.ERC1155
    address: string
    chainId: ChainId
}

export interface ERC1155TokenDetailed extends ERC1155Token {
    name: string
    tokenId: string
    uri?: string
}

export interface ERC1155TokenAssetDetailed extends ERC1155TokenDetailed {
    asset?: {
        name?: string
        decimals?: string
        description?: string
        image?: string
        properties?: Record<string, string | any[] | Record<string, any>>
    }
}
// #endregion

// #region fungible token
export type FungibleToken = NativeToken | ERC20Token
export type FungibleTokenDetailed = NativeTokenDetailed | ERC20TokenDetailed
// #endregion

// #region non-fungible token
export type NonFungibleToken = ERC721Token | ERC1155Token
export type NonFungibleTokenDetailed = ERC721TokenDetailed | ERC1155TokenDetailed
// #endregion

// #region token out of mask
export type FungibleTokenOutMask = Omit<FungibleTokenDetailed, 'chainId'> & {
    chain_id: ChainId
}

export type ERC721TokenOutMask = Omit<ERC721TokenDetailed, 'chainId'> & {
    chain_id: ChainId
}
// #endregion

interface TokenDetailedMap {
    [EthereumTokenType.Native]: NativeTokenDetailed
    [EthereumTokenType.ERC20]: ERC20TokenDetailed
    [EthereumTokenType.ERC721]: ERC721TokenDetailed
    [EthereumTokenType.ERC1155]: ERC1155TokenDetailed
}

interface TokenAssetDetailedMap {
    [EthereumTokenType.ERC721]: ERC721TokenDetailed
    [EthereumTokenType.ERC1155]: ERC1155TokenAssetDetailed
}

export type EthereumTokenDetailedType<T extends EthereumTokenType> = TokenDetailedMap[T]

export type TokenAssetDetailedType<T extends EthereumTokenType.ERC721 | EthereumTokenType.ERC1155> =
    TokenAssetDetailedMap[T]

// Learn more: https://eips.ethereum.org/EIPS/eip-747
export interface EthereumAssetDetailed {
    type: string // ERC20
    options: {
        address: string
        symbol?: string
        decimals?: number
        image?: string
    }
}
export interface EthereumChainDetailed {
    chainId: string // A 0x-prefixed hexadecimal string
    chainName: string
    nativeCurrency: {
        name: string
        symbol: string // 2-6 characters long
        decimals: number
    }
    rpcUrls: string[]
    blockExplorerUrls: string[]
}

export enum EthereumTokenType {
    Native = 0,
    ERC20 = 1,
    ERC721 = 2,
    ERC1155 = 3,
}

export interface EIP1559GasConfig {
    gas: number
    maxFeePerGas: number | string
    maxPriorityFeePerGas: number | string
}

export interface PriorEIP1559GasConfig {
    gas: number
    gasPrice: number | string
}

export type GasConfig = EIP1559GasConfig | PriorEIP1559GasConfig

export interface GasOptionConfig {
    maxFeePerGas?: number | string
    maxPriorityFeePerGas?: number | string
    gasPrice?: number | string
}

// Learn more for a full list of supported JSON RPC methods
// https://eth.wiki/json-rpc/API#json-rpc-methods
export enum EthereumMethodType {
    WATCH_ASSET = 'wallet_watchAsset',
    WATCH_ASSET_LEGACY = 'metamask_watchAsset',
    PERSONAL_SIGN = 'personal_sign',
    WALLET_ADD_ETHEREUM_CHAIN = 'wallet_addEthereumChain',
    WALLET_SWITCH_ETHEREUM_CHAIN = 'wallet_switchEthereumChain',
    ETH_CHAIN_ID = 'eth_chainId',
    ETH_ACCOUNTS = 'eth_accounts',
    ETH_REQUEST_ACCOUNTS = 'eth_requestAccounts',
    ETH_SEND_TRANSACTION = 'eth_sendTransaction',
    ETH_SEND_RAW_TRANSACTION = 'eth_sendRawTransaction',
    ETH_GET_CODE = 'eth_getCode',
    ETH_GAS_PRICE = 'eth_gasPrice',
    ETH_BLOCK_NUMBER = 'eth_blockNumber',
    ETH_GET_BALANCE = 'eth_getBalance',
    ETH_GET_TRANSACTION_BY_HASH = 'eth_getTransactionByHash',
    ETH_GET_TRANSACTION_RECEIPT = 'eth_getTransactionReceipt',
    ETH_GET_TRANSACTION_COUNT = 'eth_getTransactionCount',
    ETH_GET_FILTER_CHANGES = 'eth_getFilterChanges',
    ETH_NEW_PENDING_TRANSACTION_FILTER = 'eth_newPendingTransactionFilter',
    ETH_ESTIMATE_GAS = 'eth_estimateGas',
    ETH_CALL = 'eth_call',
    ETH_SIGN = 'eth_sign',
    ETH_DECRYPT = 'eth_decrypt',
    ETH_SIGN_TYPED_DATA = 'eth_signTypedData_v4',
    ETH_SIGN_TRANSACTION = 'eth_signTransaction',
    ETH_GET_LOGS = 'eth_getLogs',
    ETH_GET_ENCRYPTION_PUBLIC_KEY = 'eth_getEncryptionPublicKey',

    // only for mask
    MASK_WATCH_TRANSACTION = 'mask_watchTransaction',
    MASK_UNWATCH_TRANSACTION = 'mask_unwatchTransaction',
    MASK_GET_TRANSACTION_RECEIPT = 'mask_getTransactionReceipt',
    MASK_REPLACE_TRANSACTION = 'mask_replaceTransaction',
    MASK_CONFIRM_TRANSACTION = 'mask_confirmTransaction',
    MASK_REJECT_TRANSACTION = 'mask_rejectTransaction',
    MASK_REQUEST_ACCOUNTS = 'mask_requestAccounts',
    MASK_DISMISS_ACCOUNTS = 'mask_dismissAccounts',
}

export type EthereumTransactionConfig = TransactionConfig_ & {
    // EIP1559
    maxFeePerGas?: string
    maxPriorityFeePerGas?: string

    // CELO
    feeCurrency?: string // address of the ERC20 contract to use to pay for gas and the gateway fee
    gatewayFeeRecipient?: string // coinbase address of the full serving the light client's transactions
    gatewayFee?: string // value paid to the gateway fee recipient, denominated in the fee currency
}

// #region
export enum EthereumRpcType {
    // transaction
    CANCEL = 'cancel',
    RETRY = 'retry', // speed up

    // contract interaction
    SEND_ETHER = 'sendEther',
    CONTRACT_INTERACTION = 'contractInteraction',
    CONTRACT_DEPLOYMENT = 'contractDeployment',

    // asset
    WATCH_ASSET = 'wallet_watchAsset',

    // wallet
    WALLET_SWITCH_ETHEREUM_CHAIN = 'wallet_switchEthereumChain',

    // sign
    SIGN = 'eth_sign',
    SIGN_TYPED_DATA = 'eth_signTypedData_v4',

    // decrypt
    ETH_DECRYPT = 'eth_decrypt',
    ETH_GET_ENCRYPTION_PUBLIC_KEY = 'eth_getEncryptionPublicKey',
}

export interface RepalceTransactionComputed {
    type: EthereumRpcType.CANCEL | EthereumRpcType.RETRY

    /**
     * The original transaction config
     */
    _tx: EthereumTransactionConfig
}
export interface SendEtherComputed {
    type: EthereumRpcType.SEND_ETHER

    /**
     * The original transaction config
     */
    _tx: EthereumTransactionConfig
}
export interface ContractDeploymentComputed {
    type: EthereumRpcType.CONTRACT_DEPLOYMENT

    /**
     * code in bytes
     */
    code: string

    /**
     * The original transaction config
     */
    _tx: EthereumTransactionConfig
}
export interface ContractInteractionComputed {
    type: EthereumRpcType.CONTRACT_INTERACTION

    /**
     * the method type name of the invoked contract
     */
    name: string

    /**
     * parameters in an array of bytes (only built-in abis)
     */
    parameters?: {
        [key in string]?: string
    }

    /**
     * The original transaction config
     */
    _tx: EthereumTransactionConfig
}
export interface SignComputed {
    type: EthereumRpcType.SIGN

    /**
     * the sign to address
     */
    to: string

    /**
     * the original message
     */
    data: string
}
export interface SignTypedDataComputed {
    type: EthereumRpcType.SIGN_TYPED_DATA

    /**
     * the sign to address
     */
    to: string

    /**
     * typed data
     */
    data: any
}
export interface GetEncryptionPlulicKeyComputed {
    type: EthereumRpcType.ETH_GET_ENCRYPTION_PUBLIC_KEY

    /**
     * the account address
     */
    account: string
}

export interface DecryptComputed {
    type: EthereumRpcType.ETH_DECRYPT

    /**
     * the decrypt to address
     * Learn more: https://docs.metamask.io/guide/rpc-api.html#eth-decrypt
     */
    to: string

    /**
     * the secret message
     */
    secret: string
}

export interface SwitchChainComputed {
    type: EthereumRpcType.WALLET_SWITCH_ETHEREUM_CHAIN

    /**
     * the chain detailed
     */
    chain?: EthereumChainDetailed
}

export interface WatchAssetComputed {
    type: EthereumRpcType.WATCH_ASSET

    /**
     * the asset detailed
     */
    asset: EthereumAssetDetailed
}

export type EthereumRPC_Computed =
    | RepalceTransactionComputed
    | SendEtherComputed
    | ContractDeploymentComputed
    | ContractInteractionComputed
    | SignComputed
    | SignTypedDataComputed
    | GetEncryptionPlulicKeyComputed
    | DecryptComputed
    | SwitchChainComputed
    | WatchAssetComputed
// #endregion

export enum TransactionEventType {
    TRANSACTION_HASH = 'transactionHash',
    RECEIPT = 'receipt',
    CONFIRMATION = 'confirmation',
    ERROR = 'error',
}

export enum TransactionStatusType {
    NOT_DEPEND = 0,
    SUCCEED = 1,
    FAILED = 2,
    CANCELLED = 3,
}

export interface ChainOptions {
    chainId: ChainId
    account: string
    currencyType: CurrencyType
    providerType: ProviderType
    networkType: NetworkType
}

export interface GasOptions {
    rapid: number
    fast: number
    standard: number
    slow: number
    custom: number
}

export interface Asset {
    token: FungibleTokenDetailed
    /**
     * The chain name of assets
     */
    chain: 'eth' | string
    /**
     * The total balance of token
     */
    balance: string
    /**
     * The estimated price
     */
    price?: {
        [key in CurrencyType]: string
    }
    /**
     * The estimated value
     */
    value?: {
        [key in CurrencyType]: string
    }
    logoURI?: string
}

export enum DomainProvider {
    ENS = 'ENS',
    UNS = 'UNS',
}

export type UnboxTransactionObject<T> = T extends NonPayableTransactionObject<infer R>
    ? R
    : T extends PayableTransactionObject<infer S>
    ? S
    : T

export enum FilterTransactionType {
    ALL = 'all',
    SEND = 'send',
    RECEIVE = 'receive',
    CREATE_RED_PACKET = 'create_red_packet',
    FILL_POOL = 'fill_pool',
}

export enum TransactionType {
    SEND = 'Send',
    SWAP = 'swap',
    RECEIVE = 'Receive',
    TRANSFER = 'transfer',
    CREATE_RED_PACKET = 'create_red_packet',
    FILL_POOL = 'fill_pool',
    CLAIM = 'claim',
    REFUND = 'refund',
}

export enum DebankTransactionDirection {
    SEND = 'send',
    RECEIVE = 'receive',
}

export enum ZerionTransactionDirection {
    IN = 'in',
    OUT = 'out',
    SELF = 'self',
}

export type TransactionDirection = ZerionTransactionDirection | DebankTransactionDirection

export interface TransactionPair {
    name: string
    symbol: string
    address: string
    direction: TransactionDirection
    amount: number
}

export interface TransactionGasFee {
    eth: number
    usd: number
}

export interface Transaction {
    type: string | undefined
    id: string
    timeAt: Date
    toAddress: string
    failed: boolean
    pairs: TransactionPair[]
    gasFee: TransactionGasFee | undefined
    transactionType: string
}

export interface RecentTransaction {
    at: Date
    hash: string
    status: TransactionStatusType
    candidates: Record<string, EthereumTransactionConfig>
    computedPayload?: EthereumRPC_Computed
}

// #region address name
export enum AddressNameType {
    ADDRESS = 'ADDRESS',
    ENS = 'ENS',
    UNS = 'UNS',
    DNS = 'DNS',
    RSS3 = 'RSS3',
    GUN = 'GUN',
    THE_GRAPH = 'THE_GRAPH',
    TWITTER_BLUE = 'TWITTER_BLUE',
}

export interface AddressName {
    type: AddressNameType
    label: string
    resolvedAddress: string
}
// #endregion

export enum GasOption {
    Low = 'low',
    Medium = 'medium',
    High = 'high',
}

export enum TransactionStateType {
    UNKNOWN = 0,
    /** Wait for external provider */
    WAIT_FOR_CONFIRMING = 1,
    /** Hash is available */
    HASH = 2,
    /** Receipt is available */
    RECEIPT = 3,
    /** Confirmed or Reverted */
    CONFIRMED = 4,
    /** Fail to send */
    FAILED = 5,
}

export interface EIP1193Provider {
    request<T extends unknown>(requestArguments: RequestArguments): Promise<T>

    on(name: 'connect', listener: (connectInfo: { chainId: string }) => void): EIP1193Provider
    on(
        name: 'disconnect',
        listener: (error: { message: string; code: number; data?: unknown }) => void,
    ): EIP1193Provider
    on(name: 'chainChanged', listener: (chainId: string) => void): EIP1193Provider
    on(name: 'accountsChanged', listener: (accounts: string[]) => void): EIP1193Provider
    on(name: 'message', listener: (message: { type: string; data: unknown }) => void): EIP1193Provider
    on(name: string, listener: (event: any) => void): EIP1193Provider

    removeListener(name: string, listener: (event: any) => void): EIP1193Provider
}

/**
 * Keep updating to packages/public-api/src/web.ts
 */
export enum NetworkType {
    Ethereum = 'Ethereum',
    Binance = 'Binance',
    Polygon = 'Polygon',
    Arbitrum = 'Arbitrum',
    xDai = 'xDai',
    Celo = 'Celo',
    Fantom = 'Fantom',
    Aurora = 'Aurora',
    Avalanche = 'Avalanche',
    Boba = 'Boba',
    Fuse = 'Fuse',
    Metis = 'Metis',
    Optimistic = 'Optimistic',
    Conflux = 'Conflux',
}

export enum ProviderType {
    MaskWallet = 'Maskbook',
    MetaMask = 'MetaMask',
    WalletConnect = 'WalletConnect',
    Fortmatic = 'Fortmatic',
    Coin98 = 'Coin98',
    MathWallet = 'MathWallet',
    WalletLink = 'WalletLink',
    CustomNetwork = 'CustomNetwork',
}

export enum FungibleAssetProvider {
    ZERION = 'Zerion',
    DEBANK = 'Debank',
}

export enum NonFungibleAssetProvider {
    OPENSEA = 'OpenSea',
    RARIBLE = 'Rarible',
    NFTSCAN = 'NFTScan',
    ZORA = 'Zora',
}

export enum TransactionDataProvider {
    SCANNER = 'scanner',
}

export interface PriceRecord {
    [currency: string]: number
}

/** Base on response of coingecko's token price API */
export interface CryptoPrice {
    [token: string]: PriceRecord
}
