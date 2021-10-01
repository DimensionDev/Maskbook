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

export const RSS3_APP = 'https://hub.pass3.me'
export const NFT_AVATAR_JSON_SERVER = 'https://dimensiondev.github.io/Maskbook-Configuration/com.maskbook.avatar.json'
export const NFT_AVATAR_GUN_SERVER = 'com.maskbook.user'
