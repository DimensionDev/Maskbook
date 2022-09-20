import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { CollectionType } from '@masknet/web3-providers'

export interface CollectionTypes {
    platform: NetworkPluginID
    address: string // take id as address if collection is a poap
    key: string // address + tokenId as unique key of NFT, id as unique key of poap
    tokenId?: string
    imageURL?: string
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

export interface WalletsCollection {
    NFTs?: WalletTypes[]
    donations?: WalletTypes[]
    footprints?: WalletTypes[]
}

export interface Web3ProfileStorage {
    unListedCollections: Record<string, Record<CollectionType, string[]>>
    hiddenAddresses: WalletsCollection
}
