import type { NextIDPlatform } from '@masknet/shared-base'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'

export enum PageTags {
    WalletTag = 'Wallets',
    NFTTag = 'NFTs',
    DonationTag = 'Donations',
    FootprintTag = 'Footprints',
    DAOTag = 'DAO',
}

export interface Asset {
    chain: string
}

export interface GeneralAsset {
    platform: string
    identity: string
    id: string // contractAddress-id or admin_address
    type: string
    info: {
        collection?: string
        collection_icon?: string
        image_preview_url?: string | null
        animation_url?: string | null
        animation_original_url?: string | null
        title?: string
        total_contribs?: number
        token_contribs?: Array<{
            token: string
            amount: string
        }>
        start_date?: string
        end_date?: string
        country?: string
        city?: string
    }
}

export interface GeneralAssetWithTags extends GeneralAsset {
    tags?: string[]
}

export interface RSS3Profile {
    avatar: string[]
    bio: string
    name: string
}

export enum AssetType {
    GitcoinDonation = 'Gitcoin-Donation',
    POAP = 'POAP',
}

export interface CollectionKeys {
    NFTs: string[]
    Donations: string[]
    Footprints: string[]
    Feeds: string[]
}

export interface Patch {
    unListedCollections: Record<string, CollectionKeys>
    hiddenAddresses: WalletsCollection
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

export interface KVType {
    persona: string
    proofs: Proof[]
    hiddenAddresses: WalletsCollection
}
export interface Proof {
    platform: NextIDPlatform
    identity: string
    content?: Record<string, Patch>
}
