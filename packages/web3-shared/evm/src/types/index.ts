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

    // For any chains not supported yet.
    Invalid = 0,

    Zora = 7777777,

    ZkSyncEra = 324,

    Linea = 59144,
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
    // eip1559 only
    estimatedBaseFee?: string
    baseFeePerGas?: string
    // note: for prior 1559 it means gasPrice
    suggestedMaxFeePerGas: string
    suggestedMaxPriorityFeePerGas: string
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
    ETH_GET_FILTER_LOGS = 'eth_getFilterLogs',
    ETH_NEW_BLOCK_FILTER = 'eth_newBlockFilter',
    ETH_NEW_FILTER = 'eth_newFilter',
    ETH_NEW_PENDING_TRANSACTION_FILTER = 'eth_newPendingTransactionFilter',
    ETH_UNINSTALL_FILTER = 'eth_uninstallFilter',
    ETH_ESTIMATE_GAS = 'eth_estimateGas',
    ETH_CALL = 'eth_call',
    ETH_SIGN = 'eth_sign',
    ETH_DECRYPT = 'eth_decrypt',
    ETH_SIGN_TYPED_DATA_OLD_V1 = 'eth_signTypedData',
    ETH_SIGN_TYPED_DATA_OLD_V3 = 'eth_signTypedData_v3',
    ETH_SIGN_TYPED_DATA = 'eth_signTypedData_v4',
    ETH_SIGN_TRANSACTION = 'eth_signTransaction',
    ETH_GET_LOGS = 'eth_getLogs',
    ETH_GET_ENCRYPTION_PUBLIC_KEY = 'eth_getEncryptionPublicKey',
    ETH_FEE_HISTORY = 'eth_feeHistory',
    ETH_GET_BLOCK_RECEIPTS = 'eth_getBlockReceipts',
    ETH_GET_BLOCK_TRANSACTION_COUNT_BY_HASH = 'eth_getBlockTransactionCountByHash',
    ETH_GET_BLOCK_TRANSACTION_COUNT_BY_NUMBER = 'eth_getBlockTransactionCountByNumber',
    ETH_GET_PROOF = 'eth_getProof',
    ETH_GET_STORAGE_AT = 'eth_getStorageAt',
    ETH_GET_TRANSACTION_BY_BLOCK_HASH_AND_INDEX = 'eth_getTransactionByBlockHashAndIndex',
    ETH_GET_TRANSACTION_BY_BLOCK_NUMBER_AND_INDEX = 'eth_getTransactionByBlockNumberAndIndex',
    ETH_GET_UNCLE_COUNT_BY_BLOCK_HASH = 'eth_getUncleCountByBlockHash',
    ETH_GET_UNCLE_COUNT_BY_BLOCK_NUMBER = 'eth_getUncleCountByBlockNumber',
    ETH_SYNCING = 'eth_syncing',
    ETH_SUBSCRIBE = 'eth_subscribe',
    ETH_UNSUBSCRIBE = 'eth_unsubscribe',

    // EIP-4337
    ETH_SEND_USER_OPERATION = 'eth_sendUserOperation',
    ETH_CALL_USER_OPERATION = 'eth_callUserOperation',
    ETH_SUPPORTED_CHAIN_IDS = 'eth_supportedChainIds',
    ETH_SUPPORTED_ENTRY_POINTS = 'eth_supportedEntryPoints',
    MASK_DEPLOY = 'mask_deploy',
    MASK_FUND = 'mask_fund',

    // only for mask
    MASK_LOGIN = 'MASK_LOGIN',
    MASK_LOGOUT = 'MASK_LOGOUT',
    MASK_WALLETS = 'MASK_WALLETS',
    MASK_ADD_WALLET = 'MASK_ADD_WALLET',
    MASK_UPDATE_WALLET = 'MASK_UPDATE_WALLET',
    MASK_RENAME_WALLET = 'MASK_RENAME_WALLET',
    MASK_REMOVE_WALLET = 'MASK_REMOVE_WALLET',
    MASK_UPDATE_WALLETS = 'MASK_UPDATE_WALLETS',
    MASK_REMOVE_WALLETS = 'MASK_REMOVE_WALLETS',
    MASK_RESET_ALL_WALLETS = 'MASK_RESET_ALL_WALLETS',
    MASK_REPLACE_TRANSACTION = 'mask_replaceTransaction',

    NET_VERSION = 'net_version',
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
    Optimism = 'Optimism',
    Conflux = 'Conflux',
    Astar = 'Astar',
    Scroll = 'Scroll',
    Moonbeam = 'Moonbeam',
    XLayer = 'XLayer',
    CustomNetwork = 'CustomNetwork',
    Zora = 'Zora',
    ZkSyncEra = 'ZkSyncEra',
    Linea = 'Linea',
}

export enum ProviderType {
    None = 'None',
    Browser = 'Browser',
    WalletConnect = 'WalletConnect',
    MaskWallet = 'Maskbook',
    MetaMask = 'MetaMask',
    Fortmatic = 'Fortmatic',
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
