export interface AvatarMetaDB {
    userId: string
    tokenId: string
    address: string
    avatarId: string
    updateFlag?: boolean
    account?: string
}

export interface NFT {
    amount: string
    symbol: string
    name: string
    image: string
    owner: string
    slug: string
}
