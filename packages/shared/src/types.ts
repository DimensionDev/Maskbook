import type { BindingProof, NetworkPluginID, PersonaInformation } from '@masknet/shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { CollectionType } from '@masknet/web3-providers/types'

export interface CollectionTypes {
    networkPluginID: NetworkPluginID
    address: string
    /**
     * Identifier of a collection
     * For NFT and POAP, it's [address, tokenId].join("_")
     * For Donation, it's [donation.hash, donation.actions[0].index].join("_")
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
    networkPluginID: NetworkPluginID
    updateTime?: string
    collections: CollectionTypes[]
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

export interface PersonaConnectStatus {
    action?: (
        target?: string | undefined,
        position?: 'center' | 'top-right' | undefined,
        enableVerify?: boolean,
        direct?: boolean,
    ) => void
    currentPersona?: PersonaInformation
    connected?: boolean
    hasPersona?: boolean
    verified?: boolean
    proof?: BindingProof[]
}
