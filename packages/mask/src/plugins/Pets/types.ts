import type { ERC721TokenInfo } from '@masknet/web3-shared-evm'
import type { Constant } from '@masknet/web3-shared-evm/constants/utils'

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
    icon: string
    tokens: OwnerERC721TokenInfo[]
}
