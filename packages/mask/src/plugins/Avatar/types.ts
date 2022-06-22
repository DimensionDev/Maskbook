import type { Web3Helper } from '@masknet/plugin-infra/web3'
import type { NetworkPluginID, NonFungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

export interface AvatarMetaDB {
    userId: string
    tokenId: string
    address: string
    avatarId: string
    chainId?: ChainId
    schema?: SchemaType
    pluginId?: NetworkPluginID
}

export interface NFT {
    amount: string
    symbol: string
    name: string
    image: string
    owner: string
    slug: string
}

export type AllChainsNonFungibleToken = NonFungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>

export interface SelectTokenInfo {
    account: string
    token: AllChainsNonFungibleToken
    image: string
    pluginId: NetworkPluginID
    nftUsage: NFT_USAGE
}

export interface NextIDAvatarMeta extends AvatarMetaDB {
    nickname: string
    imageUrl: string
}

export interface NFTRSSNode {
    signature: string
    nft?: AvatarMetaDB
    background?: AvatarMetaDB
}

export const RSS3Cache = new Map<string, [Promise<NFTRSSNode | undefined>, number]>()

export interface NFTInfo {
    amount: string
    name: string
    symbol: string
    image: string
    owner: string
    slug: string
    permalink: string
}

export enum NFT_USAGE {
    NFT_PFP = 0,
    NFT_BACKGROUND = 1,
}
