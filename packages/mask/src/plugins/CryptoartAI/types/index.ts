import type { ChainId } from '@masknet/web3-shared-evm'

export interface PayloadType {
    chain_id: ChainId
    creator: string
    token_id: string
    contractAddress: string
}

export enum TabState {
    ARTICLE = 0,
    TOKEN = 1,
    OFFER = 2,
    HISTORY = 3,
}

export interface Token {
    chainId: ChainId
    creator: string
    tokenId: string
    contractAddress: string
}

export enum TransactionType {
    BID_WITHDRAW = 'Bid Withdrawn',
    SETTLED = 'Settled',
    BID_PLACED = 'Bid Placed',
    ON_SALE = 'On Sale',
    EDITION_CREATED = 'Edition Created',
}
