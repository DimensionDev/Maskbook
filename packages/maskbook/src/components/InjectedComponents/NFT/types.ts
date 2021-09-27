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
export const NFT_AVATAR_JSON_SERVER =
    'https://raw.githubusercontent.com/DimensionDev/Maskbook-Configuration/master/development/com.maskbook.avatar.json'
