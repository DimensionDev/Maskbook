import type { ERC721TokenDetailed } from '@masknet/web3-shared-evm'

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

export interface SelectTokenInfo {
    account: string
    token: ERC721TokenDetailed
    image: string
}

export interface TokenInfo {
    address: string
    tokenId: string
}
