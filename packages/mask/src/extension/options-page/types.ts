import type { NextIDPlatform } from '@masknet/shared-base'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'

export interface CollectionKeys {
    NFTs: string[]
    Donations: string[]
    Footprints: string[]
    Feeds: string[]
}
export interface WalletsCollection {
    NFTs?: WalletTypes[]
    donations?: WalletTypes[]
    footprints?: WalletTypes[]
}

export interface CollectionTypes {
    platform: NetworkPluginID
    address: string // take id as address if collection is a poap
    key: string // address + tokenId as unique key of NFT, id as unique key of poap
    tokenId?: string
    iconURL?: string
    hidden?: boolean
    name?: string
    chainId?: ChainId
}
export interface WalletTypes {
    address: string
    platform?: NetworkPluginID
    updateTime?: string
    collections?: CollectionTypes[]
}

export interface Patch {
    unListedCollections: Record<string, CollectionKeys>
    hiddenAddresses: WalletsCollection
}
export interface KVType {
    persona: string
    proofs: Proof[]
}
export interface Proof {
    platform: NextIDPlatform
    identity: string
    content?: Record<string, Patch>
}
