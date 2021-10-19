export interface AvatarMetaDB {
    userId: string
    tokenId: string
    address: string
    avatarId: string
}

export interface NFT {
    amount: string
    symbol: string
    name: string
    image: string
}

export const NFT_AVATAR_SERVER = 'com.maskbook.nft.avatar'
export const NFT_AVATAR_JSON_SERVER = 'https://dimensiondev.github.io/Maskbook-Configuration/com.maskbook.avatar.json'
