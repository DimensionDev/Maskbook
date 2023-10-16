import type { Constant, NonFungibleAsset } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

export interface PetsDialogEvent {
    open: boolean
}

export interface EssayRSSNode {
    address: string
    signature: string
    essay: PetMetaDB
}

export interface ConfigRSSNode {
    address: string
    signature: string
    essay: Record<string, Constant>
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
    contract: string
    tokenId: string
    chainId: ChainId | undefined
}

export interface User {
    userId: string
    address: string
}

export interface OwnerERC721TokenInfo extends NonFungibleAsset<ChainId, SchemaType> {
    glbSupport: boolean
}

export interface FilterContract {
    name: string
    contract: string
    icon: string
    tokens: OwnerERC721TokenInfo[]
    chainId: ChainId | undefined
}
export interface NonFungibleContract {
    name: string
    contract: string
    icon: string
    chainId: ChainId | undefined
    tokens: Record<string, OwnerERC721TokenInfo>
}
