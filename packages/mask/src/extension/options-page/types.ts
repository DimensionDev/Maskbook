import type { NextIDPlatform } from '@masknet/shared-base'

export enum COLLECTION_TYPE {
    NFTs = 'NFTs',
    Donations = 'Donations',
    Footprints = 'Footprints',
}

export interface collectionKeys {
    NFTs: string[]
    Donations: string[]
    Footprints: string[]
}
export interface patch {
    unListedCollections: Record<string, collectionKeys>
}
export interface kvType {
    persona: string
    proofs: proof[]
}
export interface proof {
    platform: NextIDPlatform
    identity: string
    content?: Record<string, patch>
}
