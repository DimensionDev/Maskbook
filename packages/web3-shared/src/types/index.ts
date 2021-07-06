import type { NonPayableTransactionObject, PayableTransactionObject } from '@masknet/contracts/types/types'

export enum CurrencyType {
    USD = 'usd',
}

// bigint is not in our list. iOS doesn't support that.
export type Primitive = string | number | boolean | symbol | undefined | null

export interface Web3Constants {
    [K: string]: { [K in ChainId]: Primitive | Primitive[] }
}

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
}

export enum ProviderType {
    Maskbook = 'Maskbook',
    MetaMask = 'MetaMask',
    WalletConnect = 'WalletConnect',
    CustomNetwork = 'CustomNetwork',
}

export enum NetworkType {
    Ethereum = 'Ethereum',
    Binance = 'Binance',
    Polygon = 'Polygon',
}

export interface Wallet {
    /** ethereum hex address */
    address: string
    /** User define wallet name. Default address.prefix(6) */
    name: string | null
    hasPrivateKey: boolean
    /** A list of trusted ERC20 contract address */
    erc20_token_whitelist: Set<string>
    /** A list of untrusted ERC20 contract address */
    erc20_token_blacklist: Set<string>
    /** A list of trusted ERC721 contract address */
    erc721_token_whitelist: Set<string>
    /** A list of untrusted ERC721 contract address */
    erc721_token_blacklist: Set<string>
    /** A list of trusted ERC1155 contract address */
    erc1155_token_whitelist: Set<string>
    /** A list of untrusted ERC1155 contract address */
    erc1155_token_blacklist: Set<string>
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
    logoURI?: string
}
//#endregion

//#region ERC721
export interface ERC721Token {
    type: EthereumTokenType.ERC721
    address: string
    chainId: ChainId
}
export interface ERC721TokenDetailed extends ERC721Token {
    name: string
    symbol: string
    tokenId: string
    baseURI?: string
    tokenURI?: string
}

export interface ERC721TokenAssetDetailed extends ERC721TokenDetailed {
    asset?: {
        name?: string
        description?: string
        image?: string
    }
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
        properties?: {
            [key: string]: string | any[] | { [key: string]: any }
        }
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
    [EthereumTokenType.ERC721]: ERC721TokenAssetDetailed
    [EthereumTokenType.ERC1155]: ERC1155TokenAssetDetailed
}

export type EthereumTokenDetailedType<T extends EthereumTokenType> = TokenDetailedMap[T]

export type TokenAssetDetailedType<T extends EthereumTokenType.ERC721 | EthereumTokenType.ERC1155> =
    TokenAssetDetailedMap[T]

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

// Learn more for a full list of supported JSON RPC methods
// https://eth.wiki/json-rpc/API#json-rpc-methods
export enum EthereumMethodType {
    PERSONAL_SIGN = 'personal_sign',
    WALLET_ADD_ETHEREUM_CHAIN = 'wallet_addEthereumChain',
    ETH_SEND_TRANSACTION = 'eth_sendTransaction',
    ETH_SEND_RAW_TRANSACTION = 'eth_sendRawTransaction',
    ETH_GAS_PRICE = 'eth_gasPrice',
    ETH_BLOCK_NUMBER = 'eth_blockNumber',
    ETH_GET_BALANCE = 'eth_getBalance',
    ETH_GET_TRANSACTION_BY_HASH = 'eth_getTransactionByHash',
    ETH_GET_TRANSACTION_RECEIPT = 'eth_getTransactionReceipt',
    ETH_GET_TRANSACTION_COUNT = 'eth_getTransactionCount',
    ETH_ESTIMATE_GAS = 'eth_estimateGas',
    ETH_SIGN = 'eth_sign',
    ETH_SIGN_TRANSACTION = 'eth_signTransaction',
}

export enum TransactionEventType {
    TRANSACTION_HASH = 'transactionHash',
    RECEIPT = 'receipt',
    CONFIRMATION = 'confirmation',
    ERROR = 'error',
}

export enum TransactionStatusType {
    NOT_DEPEND,
    SUCCEED,
    FAILED,
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
    logoURL?: string
}

export enum PortfolioProvider {
    ZERION,
    DEBANK,
}

export enum CollectibleProvider {
    OPENSEAN,
}

export type UnboxTransactionObject<T> = T extends NonPayableTransactionObject<infer R>
    ? R
    : T extends PayableTransactionObject<infer S>
    ? S
    : T
