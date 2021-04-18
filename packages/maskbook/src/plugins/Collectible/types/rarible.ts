import type { WyvernSchemaName } from 'opensea-js/lib/types'

export interface RaribleTransferItem {
    date: string
    owner: string
    from: string
    token: string
    tokenId: string
    value: number
    type: string
}

export enum RARIBLEFEATURES {
    APPROVE_FOR_ALL = 'APPROVE_FOR_ALL',
    SET_URI_PREFIX = 'SET_URI_PREFIX',
    BURN = 'BURN',
    MINT_WITH_ADDRESS = 'MINT_WITH_ADDRESS',
    SECONDARY_SALE_FEES = 'SECONDARY_SALE_FEES',
}

export interface RaribleNFTItemResponse {
    /** Item identifier, has format "token:tokenId" **/
    id: string
    token: string
    tokenId: string
    /** Was item locked **/
    unlockable: boolean
    creator: string
    /** Sum of items were emitted and left lazy ones **/
    supply: number
    /** Left lazy items **/
    lazySupply: number
    /** Owners of the target items **/
    owners: string[]
    /** List of royalties **/
    royalties: { account: string; value: number }[]
    pending?: RaribleTransferItem[]
}

export interface RaribleNFTItemMetaResponse {
    properties: {
        /** Identifies the asset to which this NFT represents **/
        name: string
        /** Describes the asset to which this NFT represents **/
        description: string
        /** A URI pointing to a resource with mime type image/* representing the asset to which this NFT represents. Consider making any images at a width between 320 and 1080 pixels and aspect ratio between 1.91:1 and 4:5 inclusive. **/
        image: string
        imagePreview: string
        imageBig: string
        animation_url: string
        attributes: { key: string; value: string }[]
    }
    meta: {
        imageMeta: {
            type: string
            width: number
            height: number
        }
        animationMeta: {
            type: string
            width: number
            height: number
        }
    }
}

export interface RaribleCollectionResponse {
    id: string
    /** Enum: "ERC721" "ERC1155" **/
    type: WyvernSchemaName
    owner?: string
    name: string
    symbol: string
    features: RARIBLEFEATURES[]
}
