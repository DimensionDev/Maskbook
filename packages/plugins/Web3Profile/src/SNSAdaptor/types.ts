import type { BindingProof, NextIDPlatform, ProfileInformation } from '@masknet/shared-base'

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

export interface PersonaKV {
    persona: string
    proofs?: Proof[]
}
export interface Patch {
    hiddenAddresses: WalletsCollection
    unListedCollections: Record<
        string,
        {
            NFTS: string[]
            Donations: string[]
            Footprints: string[]
        }
    >
}
export interface Proof {
    platform: NextIDPlatform
    identity: string
    content?: Record<string, Patch>
}
export interface CollectionTypes {
    platform: string
    address: string
    key: string // address + tokenId as unique key of NFT, address + imageURL as unique key of poap
    tokenId?: string
    iconURL?: string
    hidden?: boolean
}

export interface Collection {
    address: string
    collections?: CollectionTypes[]
}
export enum AssetType {
    GitcoinDonation = 'Gitcoin-Donation',
    POAP = 'POAP',
}
export interface Response {
    status: boolean
    assets: GeneralAsset[]
}

export interface WalletsCollection {
    NFTs?: WalletTypes[]
    donations?: WalletTypes[]
    footprints?: WalletTypes[]
}

export interface WalletTypes {
    address: string
    platform?: string
    collections?: CollectionTypes[]
}

export interface accountType extends BindingProof {
    walletList: WalletsCollection
    linkedProfile?: ProfileInformation
}

export interface personaInfo {
    accountList: accountType[]
}
