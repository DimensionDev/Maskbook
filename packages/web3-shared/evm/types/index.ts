import type { TransactionConfig as TransactionConfig_ } from 'web3-core'
import type { NonPayableTransactionObject, PayableTransactionObject } from '@masknet/web3-contracts/types/types'

export enum CurrencyType {
    USD = 'usd',
}

export interface PriceRecord {
    [currency: string]: number
}
/** Base on response of coingecko's token price API */
export interface CryptoPrice {
    [token: string]: PriceRecord
}

// bigint is not in our list. iOS doesn't support that.
export type Primitive = string | number | boolean | symbol | undefined | null

export type Web3Constants = Record<string, { [K in ChainId]: Primitive | Primitive[] }>

// Learn more about ethereum ChainId https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
export enum ChainId {
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
}

export enum ProviderType {
    MaskWallet = 'Maskbook',
    MetaMask = 'MetaMask',
    WalletConnect = 'WalletConnect',
    CustomNetwork = 'CustomNetwork',
}

export enum LockStatus {
    INIT = 0,
    UNLOCK = 1,
    LOCKED = 2,
}

// If you change this enum, please sync it to packages/public-api/src/web.ts
// (it's a breaking change. Please notify the iOS and Android dev)
export enum NetworkType {
    Ethereum = 'Ethereum',
    Binance = 'Binance',
    Polygon = 'Polygon',
    Arbitrum = 'Arbitrum',
    xDai = 'xDai',
}

//#region Ether
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
//#endregion

//#region ERC20
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
//#endregion

//#region ERC721
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
    image?: string
    owner?: string
}

export interface ERC721TokenDetailed {
    tokenId: string
    info: ERC721TokenInfo
    contractDetailed: ERC721ContractDetailed
}

export interface ERC721TokenRecordInDatabase extends ERC721TokenDetailed {
    record_id: string
}

//#endregion

//#region ERC1155
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
//#endregion

//#region fungible token
export type FungibleToken = NativeToken | ERC20Token
export type FungibleTokenDetailed = NativeTokenDetailed | ERC20TokenDetailed
//#endregion

//#region non-fungible token
export type NonFungibleToken = ERC721Token | ERC1155Token
export type NonFungibleTokenDetailed = ERC721TokenDetailed | ERC1155TokenDetailed
//#endregion

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

export type EIP1559GasConfig = {
    gas: number
    maxFeePerGas: number | string
    maxPriorityFeePerGas: number | string
}

export type PriorEIP1559GasConfig = {
    gas: number
    gasPrice: number | string
}

export type GasConfig = EIP1559GasConfig | PriorEIP1559GasConfig

// Learn more for a full list of supported JSON RPC methods
// https://eth.wiki/json-rpc/API#json-rpc-methods
export enum EthereumMethodType {
    WATCH_ASSET = 'wallet_watchAsset',
    WATCH_ASSET_LEGACY = 'metamask_watchAsset',
    PERSONAL_SIGN = 'personal_sign',
    WALLET_ADD_ETHEREUM_CHAIN = 'wallet_addEthereumChain',
    WALLET_SWITCH_ETHEREUM_CHAIN = 'wallet_switchEthereumChain',
    ETH_ACCOUNTS = 'eth_accounts',
    ETH_SEND_TRANSACTION = 'eth_sendTransaction',
    ETH_SEND_RAW_TRANSACTION = 'eth_sendRawTransaction',
    ETH_GET_CODE = 'eth_getCode',
    ETH_GAS_PRICE = 'eth_gasPrice',
    ETH_BLOCK_NUMBER = 'eth_blockNumber',
    ETH_GET_BALANCE = 'eth_getBalance',
    ETH_GET_TRANSACTION_BY_HASH = 'eth_getTransactionByHash',
    ETH_GET_TRANSACTION_RECEIPT = 'eth_getTransactionReceipt',
    ETH_GET_TRANSACTION_COUNT = 'eth_getTransactionCount',
    ETH_ESTIMATE_GAS = 'eth_estimateGas',
    ETH_CALL = 'eth_call',
    ETH_SIGN = 'eth_sign',
    ETH_DECRYPT = 'eth_decrypt',
    ETH_SIGN_TYPED_DATA = 'eth_signTypedData',
    ETH_SIGN_TRANSACTION = 'eth_signTransaction',
    ETH_GET_LOGS = 'eth_getLogs',
    ETH_GET_ENCRYPTION_PUBLIC_KEY = 'eth_getEncryptionPublicKey',
}

export type EthereumTransactionConfig = TransactionConfig_ & {
    // EIP1559
    maxFeePerGas?: string
    maxPriorityFeePerGas?: string
}

// RPC need to be confirmed by the user
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
    SIGN_TYPED_DATA = 'eth_signTypedData',

    // decrypt
    ETH_DECRYPT = 'eth_decrypt',
    ETH_GET_ENCRYPTION_PUBLIC_KEY = 'eth_getEncryptionPublicKey',
}

export type EthereumRpcComputed =
    | {
          type: EthereumRpcType.CANCEL | EthereumRpcType.RETRY

          /**
           * The replacement transaction
           */
          tx: EthereumTransactionConfig

          /**
           * The original transaction config
           */
          _tx: EthereumTransactionConfig
      }
    | {
          type: EthereumRpcType.SEND_ETHER

          /**
           * The original transaction config
           */
          _tx: EthereumTransactionConfig
      }
    | {
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
    | {
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
    | {
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
    | {
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
    | {
          type: EthereumRpcType.ETH_GET_ENCRYPTION_PUBLIC_KEY

          /**
           * the account address
           */
          account: string
      }
    | {
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
    | {
          type: EthereumRpcType.WALLET_SWITCH_ETHEREUM_CHAIN

          /**
           * the chain detailed
           */
          chain?: EthereumChainDetailed
      }
    | {
          type: EthereumRpcType.WATCH_ASSET

          /**
           * the asset detailed
           */
          asset: EthereumAssetDetailed
      }

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

export type GasNow = {
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

export enum PortfolioProvider {
    ZERION = 0,
    DEBANK = 1,
}

export enum CollectibleProvider {
    OPENSEA = 0,
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

export type TransactionGasFee = {
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

//#region address name
export enum AddressNameType {
    ENS = 'ENS',
    UNS = 'UNS',
    DNS = 'DNS',
}

export interface AddressName {
    label: string
    ownerAddress: string
    resolvedAddress?: string
}
//#endregion

export enum GasOption {
    Low = 'low',
    Medium = 'medium',
    High = 'high',
}
