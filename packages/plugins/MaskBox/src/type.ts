import type { FungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

export enum BoxState {
    UNKNOWN = 0,
    NOT_READY = 1,
    READY = 2,
    EXPIRED = 3,
    /** sold all tokens out */
    SOLD_OUT = 4,
    /** drew all personal limited tokens */
    DREW_OUT = 5,
    /** canceled */
    CANCELED = 6,
    /** error occur */
    ERROR = 7,
    /** 404 */
    NOT_FOUND = 8,
    /** leaf not found */
    NOT_IN_WHITELIST = 9,
    /** insufficient holder token */
    INSUFFICIENT_HOLDER_TOKEN = 10,
    /** not qualified */
    NOT_QUALIFIED = 11,
}

interface PaymentInfo {
    token: FungibleToken<ChainId, SchemaType>
    price: string
    receivableAmount: string
}

export interface BoxInfo {
    boxId: string
    creator: string
    name: string
    sellAll: boolean
    personalLimit: number
    personalRemaining: number
    payments: PaymentInfo[]
    remaining: number
    availableAmount: number
    total: number
    sold: number
    startAt: Date
    endAt: Date
    started: boolean
    tokenIds: string[]
    tokenIdsPurchased: string[]
    tokenAddress: string
    heroImageURL: string
    qualificationAddress: string
    canceled: boolean
    holderMinTokenAmount: string
    holderTokenAddress: string
}

export enum MediaType {
    Audio = 'audio',
    Image = 'image',
    Video = 'video',
    Unknown = 'unknown',
}

export interface BoxMetadata {
    id: string
    name: string
    mediaType: MediaType
    mediaUrl: string
    activities: Array<{
        title: string
        body: string
    }>
}
