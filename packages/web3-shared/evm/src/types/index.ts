import type { Transaction as Web3Transaction, TransactionReceipt as Web3TransactionReceipt } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type { NonPayableTransactionObject, PayableTransactionObject } from '@masknet/web3-contracts/types/types.js'
import type { Web3State as Web3StateShared, GasOptionType } from '@masknet/web3-shared-base'
import type { Web3 } from '../libs/Web3.js'

export type ChainIdOptionalRecord<T> = { [k in ChainId]?: T }

// Learn more at: https://eips.ethereum.org/EIPS/eip-3085
export interface EIP3085Descriptor {
    chainId: string
    blockExplorerUrls?: string[]
    chainName?: string
    iconUrls?: string[]
    nativeCurrency?: {
        name: string
        symbol: string
        decimals: number
    }
    rpcUrls?: string[]
}

// Learn more about ethereum ChainId https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
export enum ChainId {
    // Mainnet
    Mainnet = 1,
    Ropsten = 3,
    Rinkeby = 4,
    Gorli = 5,
    Kovan = 42,

    // Base
    Base = 8453,
    Base_Goerli = 84531,

    // BSC
    BSC = 56,
    BSCT = 97,

    // Polygon
    Polygon = 137,
    Mumbai = 80001,

    // Arbitrum
    Arbitrum = 42161,
    Arbitrum_Rinkeby = 421611,
    Arbitrum_Nova = 42170,

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
    Metis_Sepolia = 59902,

    // Sei
    Sei = 1329,

    // Optimism
    Optimism = 10,
    Optimism_Kovan = 69,
    Optimism_Goerli = 420,

    // Conflux
    Conflux = 1030,

    // Astar
    Astar = 592,

    Scroll = 534352,

    ZKSync_Alpha_Testnet = 280,

    Crossbell = 3737,

    Moonbeam = 1284,

    Pulse = 369,

    Klaytn = 8217,

    Harmony = 1666600000,

    Moonriver = 1285,

    Cronos = 25,

    Brise = 32520,

    Canto = 7700,

    DFK = 53935,

    Doge = 2000,

    Evmos = 9001,

    HuobiEco = 128,

    IoTex = 4689,

    Kava = 2222,

    Kcc = 321,

    Milkomeda = 2001,

    OKXChain = 66,

    Palm = 11297108109,

    RSK = 30,

    SmartBitcoinCash = 10000,

    Shiden = 336,

    SongbirdCanary = 19,

    Step = 1234,

    Telos = 40,

    Wanchain = 888,

    XLayer = 196,
    XLayer_Testnet = 195,

    /** BitTorrent Chain Mainnet */
    BitTorrent = 199,

    Zora = 7777777,

    // For any chains not supported yet.
    Invalid = 0,
}

export enum AddressType {
    ExternalOwned = 1,
    Contract = 2,
}

export enum SchemaType {
    Native = 1,
    ERC20 = 2,
    ERC721 = 3,
    ERC1155 = 4,
    SBT = 5,
}

export interface EIP1559GasConfig {
    gas?: string
    gasCurrency?: string
    maxFeePerGas: string
    maxPriorityFeePerGas: string
    gasPrice?: string
    gasOptionType?: GasOptionType
}

export interface PriorEIP1559GasConfig {
    gas?: string
    gasPrice: string
    gasCurrency?: string
    gasOptionType?: GasOptionType
}

export type GasConfig = EIP1559GasConfig | PriorEIP1559GasConfig

export interface GasOption {
    estimatedSeconds: number
    /** eip1559 only */
    estimatedBaseFee?: string
    baseFeePerGas?: string
    /** note: for prior 1559 it means gasPrice */
    suggestedMaxFeePerGas: string
    suggestedMaxPriorityFeePerGas: string
}

// https://ethereum.github.io/execution-apis/api-documentation/
// if it's readonly, also add it in packages/web3-shared/evm/src/helpers/isReadonlyMethodType.ts
// if it's risky, also add it in packages/web3-shared/evm/src/helpers/isRiskyMethodType.ts
export enum EthereumMethodType {
    // Core methods
    eth_accounts = 'eth_accounts',
    eth_blobBaseFee = 'eth_blobBaseFee',
    eth_blockNumber = 'eth_blockNumber',
    eth_call = 'eth_call',
    eth_chainId = 'eth_chainId',
    eth_decrypt = 'eth_decrypt',
    eth_estimateGas = 'eth_estimateGas',
    eth_feeHistory = 'eth_feeHistory',
    eth_gasPrice = 'eth_gasPrice',
    eth_getBalance = 'eth_getBalance',
    eth_getBlockByHash = 'eth_getBlockByHash',
    eth_getBlockByNumber = 'eth_getBlockByNumber',
    eth_getBlockReceipts = 'eth_getBlockReceipts',
    eth_getBlockTransactionCountByHash = 'eth_getBlockTransactionCountByHash',
    eth_getBlockTransactionCountByNumber = 'eth_getBlockTransactionCountByNumber',
    eth_getCode = 'eth_getCode',
    eth_getLogs = 'eth_getLogs',
    eth_getProof = 'eth_getProof',
    eth_getStorageAt = 'eth_getStorageAt',
    eth_getTransactionByBlockHashAndIndex = 'eth_getTransactionByBlockHashAndIndex',
    eth_getTransactionByBlockNumberAndIndex = 'eth_getTransactionByBlockNumberAndIndex',
    eth_getTransactionByHash = 'eth_getTransactionByHash',
    eth_getTransactionCount = 'eth_getTransactionCount',
    eth_getTransactionReceipt = 'eth_getTransactionReceipt',
    eth_getUncleCountByBlockHash = 'eth_getUncleCountByBlockHash',
    eth_getUncleCountByBlockNumber = 'eth_getUncleCountByBlockNumber',
    eth_maxPriorityFeePerGas = 'eth_maxPriorityFeePerGas',
    eth_sendRawTransaction = 'eth_sendRawTransaction',
    eth_sendTransaction = 'eth_sendTransaction',
    eth_sign = 'eth_sign',
    eth_signTransaction = 'eth_signTransaction',
    eth_signTypedData_v4 = 'eth_signTypedData_v4',
    eth_supportedChainIds = 'eth_supportedChainIds', // unknown EIP
    eth_syncing = 'eth_syncing',
    personal_sign = 'personal_sign',
    // Filters
    eth_getFilterChanges = 'eth_getFilterChanges',
    eth_getFilterLogs = 'eth_getFilterLogs',
    eth_newBlockFilter = 'eth_newBlockFilter',
    eth_newFilter = 'eth_newFilter',
    eth_newPendingTransactionFilter = 'eth_newPendingTransactionFilter',
    eth_uninstallFilter = 'eth_uninstallFilter',

    // https://eips.ethereum.org/EIPS/eip-747
    wallet_watchAsset = 'wallet_watchAsset',

    // https://eips.ethereum.org/EIPS/eip-2255
    wallet_getPermissions = 'wallet_getPermissions',
    wallet_requestPermissions = 'wallet_requestPermissions',

    // https://eips.ethereum.org/EIPS/eip-1102
    eth_requestAccounts = 'eth_requestAccounts',

    // https://eips.ethereum.org/EIPS/eip-1474
    net_version = 'net_version',

    // https://eips.ethereum.org/EIPS/eip-3085
    wallet_addEthereumChain = 'wallet_addEthereumChain',

    // https://eips.ethereum.org/EIPS/eip-3326
    wallet_switchEthereumChain = 'wallet_switchEthereumChain',

    // https://eips.ethereum.org/EIPS/eip-4337
    eth_callUserOperation = 'eth_callUserOperation',
    eth_sendUserOperation = 'eth_sendUserOperation',
    eth_supportedEntryPoints = 'eth_supportedEntryPoints',

    // Mask Network
    MASK_ADD_WALLET = 'MASK_ADD_WALLET',
    MASK_DEPLOY = 'mask_deploy',
    MASK_FUND = 'mask_fund',
    MASK_LOGIN = 'MASK_LOGIN',
    MASK_LOGOUT = 'MASK_LOGOUT',
    MASK_REMOVE_WALLET = 'MASK_REMOVE_WALLET',
    MASK_REMOVE_WALLETS = 'MASK_REMOVE_WALLETS',
    MASK_RENAME_WALLET = 'MASK_RENAME_WALLET',
    MASK_REPLACE_TRANSACTION = 'mask_replaceTransaction',
    MASK_RESET_ALL_WALLETS = 'MASK_RESET_ALL_WALLETS',
    MASK_UPDATE_WALLET = 'MASK_UPDATE_WALLET',
    MASK_UPDATE_WALLETS = 'MASK_UPDATE_WALLETS',
    MASK_WALLETS = 'MASK_WALLETS',
}

export enum TransactionEventType {
    TRANSACTION_HASH = 'transactionHash',
    RECEIPT = 'receipt',
    CONFIRMATION = 'confirmation',
    ERROR = 'error',
}

export type UnboxTransactionObject<T> =
    T extends NonPayableTransactionObject<infer R> ? R
    : T extends PayableTransactionObject<infer S> ? S
    : T

export enum NetworkType {
    Ethereum = 'Ethereum',
    Binance = 'Binance',
    Base = 'Base',
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
    Sei = 'Sei',
    Optimism = 'Optimism',
    Conflux = 'Conflux',
    Astar = 'Astar',
    Scroll = 'Scroll',
    Moonbeam = 'Moonbeam',
    XLayer = 'XLayer',
    Zora = 'Zora',
    CustomNetwork = 'CustomNetwork',
}

export enum ProviderType {
    None = 'None',
    Browser = 'Browser',
    MaskWallet = 'Maskbook',
    MetaMask = 'MetaMask',
    WalletConnect = 'WalletConnect',
    Fortmatic = 'Fortmatic',
    Coin98 = 'Coin98',
    Coinbase = 'Coinbase',
    Crypto = 'Crypto',
    OKX = 'OKX',
    Opera = 'Opera',
    Clover = 'Clover',
    BitGet = 'BitGet',
    OneKey = 'OneKey',
    Rabby = 'Rabby',
    Rainbow = 'Rainbow',
    Trust = 'Trust',
    TokenPocket = 'TokenPocket',
    Zerion = 'Zerion',
    CustomEvent = 'CustomEvent',
}

/**
 * EIP-1193 compatible provider
 */
export interface Web3Provider {
    send(
        payload: JsonRpcPayload,
        callback: (error: Error | null, response?: JsonRpcResponse) => void,
    ): Promise<JsonRpcResponse>
    sendAsync(
        payload: JsonRpcPayload,
        callback: (error: Error | null, response?: JsonRpcResponse) => void,
    ): Promise<JsonRpcResponse>
    request<T>(requestArguments: RequestArguments): Promise<T>

    on(name: 'connect', listener: (connectInfo: { chainId: string }) => void): Web3Provider
    on(name: 'disconnect', listener: (error: { message: string; code: number; data?: unknown }) => void): Web3Provider
    on(name: 'chainChanged', listener: (chainId: string) => void): Web3Provider
    on(name: 'accountsChanged', listener: (accounts: string[]) => void): Web3Provider
    on(name: 'message', listener: (message: { type: string; data: unknown }) => void): Web3Provider
    on(name: string, listener: (event: any) => void): Web3Provider

    removeListener(name: string, listener: (event: any) => void): Web3Provider
}

export type Signature = string

export interface Block {
    hash: string
    nonce: string
    timestamp: string
    baseFeePerGas?: number
}

export interface RequestArguments {
    method: EthereumMethodType
    params: any[]
}

export interface RequestOptions {
    silent?: boolean
    owner?: string
    identifier?: string
    paymentToken?: string
    allowMaskAsGas?: boolean
    providerURL?: string
    gasOptionType?: GasOptionType
    maxFeePerGas?: string
    maxPriorityFeePerGas?: string
    gasPrice?: string
    gas?: string
}

export interface MessageRequest {
    arguments: RequestArguments
    options: RequestOptions
}

export type MessageResponse = JsonRpcResponse

export interface Transaction {
    from?: string
    to?: string
    value?: string
    /** gasLimit */
    gas?: string
    gasPrice?: string
    maxPriorityFeePerGas?: string
    maxFeePerGas?: string
    data?: string
    nonce?: number
    chainId?: number
    type?: '0x0' | '0x1' | '0x2'

    // CELO
    feeCurrency?: string // address of the ERC20 contract to use to pay for gas and the gateway fee
    gatewayFeeRecipient?: string // coinbase address of the full serving the light client's transactions
    gatewayFee?: string // value paid to the gateway fee recipient, denominated in the fee currency

    _disableSnackbar?: boolean
    _disableSuccessSnackbar?: boolean
    _disableExceptionSnackbar?: boolean

    _isOKXSwap?: boolean
}
export interface UserOperation {
    sender: string
    nonce?: number
    initCode?: string
    callData?: string
    callGas?: string
    verificationGas?: string
    preVerificationGas?: string
    maxFeePerGas?: string
    maxPriorityFeePerGas?: string
    paymaster?: string
    paymasterData?: string
    signature?: string
}
export type TransactionReceipt = Web3TransactionReceipt
export type TransactionDetailed = Web3Transaction
export type TransactionSignature = string
export type TransactionParameter = string | boolean | undefined

export interface TransactionOptions {
    account?: string
    chainId?: ChainId
    owner?: string
    identifier?: string
    paymentToken?: string
    allowMaskAsGas?: boolean
    providerURL?: string

    // popups control
    disableClose?: boolean
    popupsWindow?: boolean
    silent?: boolean
}

export type Web3State = Web3StateShared<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter
>

export type Web3Definition = {
    ChainId: ChainId
    AddressType: AddressType
    SchemaType: SchemaType
    ProviderType: ProviderType
    NetworkType: NetworkType
    Signature: Signature
    GasOption: GasOption
    Block: Block
    MessageRequest: MessageRequest
    MessageResponse: MessageResponse
    Operation: UserOperation
    Transaction: Transaction
    TransactionReceipt: TransactionReceipt
    TransactionDetailed: TransactionDetailed
    TransactionSignature: TransactionSignature
    TransactionParameter: TransactionParameter
    UserOperation: UserOperation
    Web3: Web3
    Web3Provider: Web3Provider
    Web3State: Web3State
}
