export namespace FriendTech {
    export interface Holder {
        address: string
        id: number
        balance: number
        /** unix timestamp in milliseconds */
        lastOnline: string
        twitterName: string
        twitterPfpUrl: string
        twitterUserId: string
        twitterUsername: string
    }
    export interface User extends Omit<Holder, 'balance'> {
        displayPrice: string
        holderCount: number
        holdingCount: number
        lifetimeFeesCollectedInWei: string
        rank: string
        shareSupply: 6
        userBio: string | null
        // cspell:disable-next-line
        watchlistCount: string
    }
    export interface TradeRecord {
        /** unix timestamp in milliseconds */
        createdAt: number
        shareAmount: string
        trader: {
            address: string
            pfpUrl: string
            /** Twitter handle */
            username: string
            name: string
        }
        subject: {
            address: string
            pfpUrl: string
            username: string
            name: string
        }
        isBuy: boolean
        ethAmount: string
        transactionIndex: number
        blockNumber: number
        commenterPfpUrls: string | null
        /** number */
        commentCount: string
    }
}
