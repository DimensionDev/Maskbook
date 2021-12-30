import type { ERC721TokenInfo } from '@masknet/web3-shared-evm'

export interface PetsDialogEvent {
    open: boolean
}

export interface EssayRSSNode {
    address: string
    signature: string
    essay: PetMetaDB
}

export enum ImageType {
    NORMAL = 'normal',
    GLB = 'glb',
}

export interface PetMetaDB extends ShowMeta {
    userId: string
    tokenId: string
    contract: string
}

export interface ShowMeta {
    image: string
    word: string
    type: ImageType
}

export interface User {
    userId: string
    address: string
}

export interface OwnerERC721TokenInfo extends ERC721TokenInfo {
    tokenId: string
    glbSupport: boolean
}

export interface FilterContract {
    name: string
    contract: string
    tokens: OwnerERC721TokenInfo[]
}
