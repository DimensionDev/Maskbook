export interface AvatarMetaDB {
    userId: string
    tokenId: string
    address: string
    avatarId: string
    updateFlag?: boolean
}

export interface NFT {
    amount: string
    symbol: string
    name: string
    image: string
    owner: string
}
