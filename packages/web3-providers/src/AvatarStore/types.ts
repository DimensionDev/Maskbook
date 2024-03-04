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
}

export interface AvatarToken {
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

export type Store = Record<string, AvatarToken | null>

export type AddressStorageV1 = { address: string; networkPluginID: NetworkPluginID.PLUGIN_EVM }
export type AddressStorageV2 = Record<string, AddressStorageV1> & Record<NetworkPluginID, string>
