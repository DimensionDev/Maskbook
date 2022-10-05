import type {} from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { CollectionType } from '@masknet/web3-providers'

export interface CollectionTypes {
    platform: NetworkPluginID
    address: string
    /**
     * Identifier of a collection
     * For NFT and POAP, it's joinKeys(address, tokenId)
     * For Donation, it's joinKeys(donation.hash, donation.actions[0].index)
     */
    key: string
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
    NFTs: WalletTypes[]
    donations: WalletTypes[]
    footprints: WalletTypes[]
}

export interface Web3ProfileStorage {
    unListedCollections: Record<string, Record<CollectionType, string[]>>
    hiddenAddresses: WalletsCollection
}
