import type createMetaMaskProvider from '@dimensiondev/metamask-extension-provider'

export enum ProviderType {
    Maskbook = 'Maskbook',
    MetaMask = 'MetaMask',
    WalletConnect = 'WalletConnect',
    CustomNetwork = 'CustomNetwork',
}

export enum CurrencyType {
    USD = 'usd',
}

export interface MetaMaskInpageProvider extends UnboxPromise<ReturnType<typeof createMetaMaskProvider>> {
    _metamask: { isUnlocked: () => Promise<boolean> }
}

//#region Ether
export interface NativeToken {
    type: EthereumTokenType.Native
    address: string
    chainId: ChainId
}

export interface NativeTokenDetailed extends NativeToken {
    name: 'Ether'
    symbol: 'ETH'
    decimals: 18
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

interface EthereumTokenDetailedMap {
    [EthereumTokenType.Native]: NativeTokenDetailed
    [EthereumTokenType.ERC20]: ERC20TokenDetailed
    [EthereumTokenType.ERC721]: ERC721TokenDetailed
    [EthereumTokenType.ERC1155]: ERC1155TokenDetailed
}

interface EthereumTokenAssetDetailedMap {
    [EthereumTokenType.ERC721]: ERC721TokenAssetDetailed
    [EthereumTokenType.ERC1155]: ERC1155TokenAssetDetailed
}

export type EthereumTokenDetailedType<T extends EthereumTokenType> = EthereumTokenDetailedMap[T]

export type EthereumTokenAssetDetailedType<
    T extends EthereumTokenType.ERC721 | EthereumTokenType.ERC1155
> = EthereumTokenAssetDetailedMap[T]

// Learn more about ethereum ChainId https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
export enum ChainId {
    Mainnet = 1,
    Ropsten = 3,
    Rinkeby = 4,
    Gorli = 5,
    Kovan = 42,
}

// Please don't use this enum but use ChainId instead
// this exists for back backward compatible
export enum EthereumNetwork {
    Mainnet = 'Mainnet',
    Ropsten = 'Ropsten',
    Rinkeby = 'Rinkeby',
    Kovan = 'Kovan',
    Gorli = 'Gorli',
}

export enum EthereumTokenType {
    Native = 0,
    ERC20 = 1,
    ERC721 = 2,
    ERC1155 = 3,
}

export enum TransactionEventType {
    TRANSACTION_HASH = 'transactionHash',
    RECEIPT = 'receipt',
    CONFIRMATION = 'confirmation',
    ERROR = 'error',
}
