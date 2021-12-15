import type { ERC721TokenInfo } from '@masknet/web3-shared-evm'

export interface PetsDialogEvent {
    open: boolean
}

export interface EssayRSSNode {
    address: string
    signature: string
    essay: PetMetaDB
}

export interface PetMetaDB {
    userId: string
    tokenId: string
    contract: string
    word: string
    image: string
}

export interface User {
    userId: string
    address: string
}

export interface OwnerERC721TokenInfo extends ERC721TokenInfo {
    tokenId: string
}

export interface FilterContract {
    name: string
    contract: string
    tokens: OwnerERC721TokenInfo[]
}

export interface CollectionNFT {
    name: string
    schema_name: string
    image_url: string
    symbol: string
    address: string
}
