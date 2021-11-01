import type { ChainId } from '@masknet/web3-shared-evm'

export interface Auction {
    id: string
    dateEnding: string
}

export interface Bidder {
    id: string
}

export interface HighestBid {
    amountInETH: string
    bidder: Bidder
}

export interface MostRecentAuction {
    dateEnding: string
    highestBid: HighestBid
    id: string
    reservePriceInETH: string
    status: string
}

export interface NftContract {
    baseURI: string
}

export interface TxOrigin {
    id: string
}

export interface NftHistory {
    amountInETH: string
    contractAddress: string
    date: string
    event: string
    id: string
    txOrigin: TxOrigin
}

export interface Nft {
    auctions: Auction[]
    id: string
    isFirstSale: boolean
    mostRecentAuction: MostRecentAuction
    nftContract: NftContract
    nftHistory: NftHistory[]
    tokenIPFSPath: string
}

export interface Data {
    nfts: Nft[]
}

export interface GraphData {
    data: Data
}

export interface Metadata {
    name: string
    description: string
    image: string
}

export interface nftData {
    graph: GraphData
    metadata: Metadata
    link: string
    chainId: ChainId
}
