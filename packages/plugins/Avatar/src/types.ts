import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

export interface AvatarMetaDB {
    userId: string
    tokenId: string
    address: string
    avatarId: string
    chainId?: ChainId
    schema?: SchemaType
    pluginId?: NetworkPluginID
    ownerAddress?: string
}

export interface NFT {
    amount: string
    symbol: string
    name: string
    image: string
    owner: string
    slug: string
}

export type AllChainsNonFungibleToken = Web3Helper.NonFungibleTokenAll

export interface SelectTokenInfo {
    account: string
    token: AllChainsNonFungibleToken
    image: string
    pluginID: NetworkPluginID
}

export interface NextIDAvatarMeta extends AvatarMetaDB {
    nickname: string
    imageUrl: string
}

export interface NFTRSSNode {
    signature: string
    nft: AvatarMetaDB
}

export interface NFTInfo {
    amount: string
    name: string
    symbol: string
    image?: string
    owner?: string
    slug?: string
    permalink?: string
    tokenId: string
}

export enum PFP_TYPE {
    BACKGROUND = 'background',
    PFP = 'pfp',
}

export type AvatarMeta = NextIDAvatarMeta & { sign: string }

export type AddressStorageV1 = { address: string; networkPluginID: NetworkPluginID }
export type AddressStorageV2 = Record<string, AddressStorageV1> & Record<NetworkPluginID, string>
