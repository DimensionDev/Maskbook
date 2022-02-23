export enum EthereumTokenType {
    Native = 0,
    ERC20 = 1,
    ERC721 = 2,
}

// #region Ether
export interface NativeToken {
    type: EthereumTokenType.Native
    address: string
    chainId: number
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
    chainId: number
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
    chainId: number
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
    chainId: number
    name: string
    iconURL?: string
    symbol: string
    slug?: string
    address: string
    addresses?: string[]
    balance: number
}
// #endregion

// #region fungible token
export type FungibleToken = NativeToken | ERC20Token
export type FungibleTokenDetailed = NativeTokenDetailed | ERC20TokenDetailed
// #endregion

// #region non-fungible token
export type NonFungibleToken = ERC721Token
export type NonFungibleTokenDetailed = ERC721TokenDetailed
// #endregion
