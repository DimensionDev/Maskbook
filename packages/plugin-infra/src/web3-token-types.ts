export enum EthereumTokenType {
    Native = 0,
    ERC20 = 1,
    ERC721 = 2,
    ERC1155 = 3,
}

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

// #region ERC1155
export interface ERC1155Token {
    type: EthereumTokenType.ERC1155
    address: string
    chainId: number
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

// #region non-fungible token
export type NonFungibleToken = ERC721Token | ERC1155Token
export type NonFungibleTokenDetailed = ERC721TokenDetailed | ERC1155TokenDetailed
// #endregion
