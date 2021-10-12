import type { FungibleTokenDetailed } from '@masknet/web3-shared'

export enum CardTab {
    Articles = 0,
    Details = 1,
}

export enum BoxState {
    UNKNOWN = 0,
    NOT_READY = 1,
    READY = 2,
    EXPIRED = 3,
    /** sold all tokens out */
    SOLD_OUT = 4,
    /** drawed all personal limited tokens */
    DRAWED_OUT = 5,
    /** error occur */
    ERROR = 6,
}

export interface PaymentOption {
    tokenAddress: string
    price: string
}

export interface PaymentInfo {
    token: FungibleTokenDetailed
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
    total: string
    startAt: Date
    endAt: Date
    tokenIds: string[]
    tokenIdsPurchased: string[]
    tokenAddress: string
    heroImageURL: string
    qualificationAddress: string
}

export interface BoxMetadata {
    id: string
    name: string
    cover: string
    activities: {
        title: string
        body: string
    }[]
}
