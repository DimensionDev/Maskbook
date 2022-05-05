import type { BindingProof, NextIDPlatform } from '@masknet/shared-base'

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
        token_contribs?: {
            token: string
            amount: string
        }[]
        start_date?: string
        end_date?: string
        country?: string
        city?: string
    }
}

export interface personaKV {
    persona: string
    proofs?: proof[]
}
export interface patch {
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
export interface proof {
    platform: NextIDPlatform
    identity: string
    content?: Record<string, patch>
}
export interface collectionTypes {
    platform: string
    iconURL?: string
    hidden?: boolean
}

export interface collection {
    address: string
    collections?: collectionTypes[]
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
    NFTs?: walletTypes[]
    donations?: walletTypes[]
    footprints?: walletTypes[]
}

export interface walletTypes {
    address: string
    platform?: string
    collections?: collectionTypes[]
}

export interface accountType extends BindingProof {
    walletList: WalletsCollection
}

export interface personaInfo {
    accountList: accountType[]
}
