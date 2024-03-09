import type { NetworkPluginID } from '@masknet/shared-base'
import { type Web3Helper } from '@masknet/web3-helpers'
import type { SchemaType } from '@masknet/web3-shared-evm'

export interface AvatarNextID<T extends NetworkPluginID> {
    pluginId?: T
    chainId?: Web3Helper.Definition[T]['ChainId']
    userId: string
    tokenId: string
    address: string
    avatarId: string
    schema?: SchemaType
    ownerAddress?: string
    nickname?: string
    imageUrl?: string
    sign?: string
}

export interface AvatarToken {
    avatarId: string
    amount: string
    name: string
    symbol: string
    image?: string
    owner?: string
    slug?: string
    permalink?: string
    tokenId: string
}

export enum RSS3_KEY_SITE {
    TWITTER = '_nfts',
    FACEBOOK = '_facebook_nfts',
    INSTAGRAM = '_instagram_nfts',
}

export interface AvatarRSS3 {
    signature: string
    nft: AvatarNextID<NetworkPluginID.PLUGIN_EVM>
}

export interface AvatarAddress {
    address: string
    networkPluginID: NetworkPluginID
}

export interface StoreItem {
    address: AvatarAddress
    avatar: AvatarNextID<NetworkPluginID>
    token: AvatarToken
}

export interface Store {
    items: Map<string, StoreItem | null>
    retrieveAddress: (userId?: string) => AvatarAddress | null
    retrieveAvatar: (userId?: string, avatarId?: string, publicKey?: string) => AvatarNextID<NetworkPluginID> | null
    retrieveToken: (userId?: string, avatarId?: string, publicKey?: string) => AvatarToken | null
}

export type AddressStorageV1 = { address: string; networkPluginID: NetworkPluginID.PLUGIN_EVM }
export type AddressStorageV2 = Record<string, AddressStorageV1> & Record<NetworkPluginID, string>
