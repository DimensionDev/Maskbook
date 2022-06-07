import type { NonFungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

export interface AvatarMetaDB {
    userId: string
    tokenId: string
    address: string
    avatarId: string
    chainId?: ChainId
    schema?: SchemaType
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
    token: NonFungibleToken<ChainId, SchemaType>
    image: string
}

export interface TokenInfo {
    address: string
    tokenId: string
}

export interface NextIDAvatarMeta extends AvatarMetaDB {
    nickname: string
    imageUrl: string
}
