/// <reference types="web3" />

import type EVM_Web3 from 'web3'
import type {
    RequestArguments,
    Transaction as Web3Transaction,
    TransactionReceipt as Web3TransactionReceipt,
    TransactionConfig as TransactionConfig_,
} from 'web3-core'
import type { NonPayableTransactionObject, PayableTransactionObject } from '@masknet/web3-contracts/types/types'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'

export type ChainIdOptionalRecord<T> = { [k in ChainId]?: T }
export type ChainIdRecord<T> = { [k in ChainId]: T }

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

    // Harmony
    Harmony = 1666600000,
    Harmony_Test = 1666700000,

    // Conflux
    Conflux = 1030,
}

/**
 * @deprecated
 */
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

export enum SchemaType {
    Native = 1,
    ERC20 = 2,
    ERC721 = 3,
    ERC1155 = 4,
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
    // https://eips.ethereum.org/EIPS/eip-3085
    WALLET_ADD_ETHEREUM_CHAIN = 'wallet_addEthereumChain',
    // https://eips.ethereum.org/EIPS/eip-3326
    WALLET_SWITCH_ETHEREUM_CHAIN = 'wallet_switchEthereumChain',
    ETH_CHAIN_ID = 'eth_chainId',
    ETH_ACCOUNTS = 'eth_accounts',
    ETH_REQUEST_ACCOUNTS = 'eth_requestAccounts',
    ETH_SEND_TRANSACTION = 'eth_sendTransaction',
    ETH_SEND_RAW_TRANSACTION = 'eth_sendRawTransaction',
    ETH_GET_CODE = 'eth_getCode',
    ETH_GAS_PRICE = 'eth_gasPrice',
    ETH_GET_BLOCK_BY_NUMBER = 'eth_getBlockByNumber',
    ETH_GET_BLOCK_BY_HASH = 'eth_getBlockByHash',
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
    MASK_LOGIN = 'MASK_LOGIN',
    MASK_LOGOUT = 'MASK_LOGOUT',
    MASK_REPLACE_TRANSACTION = 'mask_replaceTransaction',
}

export enum TransactionEventType {
    TRANSACTION_HASH = 'transactionHash',
    RECEIPT = 'receipt',
    CONFIRMATION = 'confirmation',
    ERROR = 'error',
}

export interface GasOptions {
    rapid: number
    fast: number
    standard: number
    slow: number
    custom: number
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
    CREATE_LUCKY_DROP = 'create_lucky_drop',
    FILL_POOL = 'fill_pool',
}

export enum TransactionType {
    SEND = 'Send',
    SWAP = 'swap',
    RECEIVE = 'Receive',
    TRANSFER = 'transfer',
    CREATE_LUCKY_DROP = 'create_lucky_drop',
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
    Harmony = 'Harmony',
    Conflux = 'Conflux',
}

export enum ProviderType {
    MaskWallet = 'Maskbook',
    MetaMask = 'MetaMask',
    WalletConnect = 'WalletConnect',
    Fortmatic = 'Fortmatic',
    Torus = 'Torus',
    Coin98 = 'Coin98',
    MathWallet = 'MathWallet',
    WalletLink = 'WalletLink',
    CustomNetwork = 'CustomNetwork',
}

/**
 * @deprecated use SourceType instead
 */
export enum FungibleAssetProvider {
    ZERION = 'Zerion',
    DEBANK = 'Debank',
}

/**
 * @deprecated use SourceType instead
 */
export enum NonFungibleAssetProvider {
    OPENSEA = 'OpenSea',
    RARIBLE = 'Rarible',
    NFTSCAN = 'NFTScan',
    ZORA = 'Zora',
}

export type TransactionState =
    | {
          type: TransactionStateType.UNKNOWN
      }
    | {
          type: TransactionStateType.WAIT_FOR_CONFIRMING

          // @deprecated don't depend on this property will be removed in the future
          hash?: string
      }
    | {
          type: TransactionStateType.HASH
          hash: string
      }
    | {
          type: TransactionStateType.RECEIPT
          receipt: TransactionReceipt
      }
    | {
          type: TransactionStateType.CONFIRMED
          no: number
          receipt: TransactionReceipt
          reason?: string
      }
    | {
          type: TransactionStateType.FAILED
          error: Error & { code?: number }
          receipt?: TransactionReceipt
      }

export type Web3 = EVM_Web3
export type Web3Provider = {
    send(
        payload: JsonRpcPayload,
        callback: (error: Error | null, response?: JsonRpcResponse) => void,
    ): Promise<JsonRpcResponse>
    sendAsync(
        payload: JsonRpcPayload,
        callback: (error: Error | null, response?: JsonRpcResponse) => void,
    ): Promise<JsonRpcResponse>
    request<T extends unknown>(requestArguments: RequestArguments): Promise<T>

    on(name: 'connect', listener: (connectInfo: { chainId: string }) => void): Web3Provider
    on(name: 'disconnect', listener: (error: { message: string; code: number; data?: unknown }) => void): Web3Provider
    on(name: 'chainChanged', listener: (chainId: string) => void): Web3Provider
    on(name: 'accountsChanged', listener: (accounts: string[]) => void): Web3Provider
    on(name: 'message', listener: (message: { type: string; data: unknown }) => void): Web3Provider
    on(name: string, listener: (event: any) => void): Web3Provider

    removeListener(name: string, listener: (event: any) => void): Web3Provider
}
export type GasOption = {
    estimatedSeconds: number
    // eip1559 only
    estimatedBaseFee?: string
    // note: for prior 1559 it means gasPrice
    suggestedMaxFeePerGas: string
    suggestedMaxPriorityFeePerGas: string
}
export type Signature = string
export type Block = {
    hash: string
    nonce: string
    timestamp: string
}
export type Transaction = TransactionConfig_ & {
    // CELO
    feeCurrency?: string // address of the ERC20 contract to use to pay for gas and the gateway fee
    gatewayFeeRecipient?: string // coinbase address of the full serving the light client's transactions
    gatewayFee?: string // value paid to the gateway fee recipient, denominated in the fee currency
}
export type TransactionReceipt = Web3TransactionReceipt
export type TransactionDetailed = Web3Transaction
export type TransactionSignature = string
export type TransactionParameter = string | undefined
