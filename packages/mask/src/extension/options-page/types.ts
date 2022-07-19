import type { NextIDPlatform } from '@masknet/shared-base'

export enum COLLECTION_TYPE {
    NFTs = 'NFTs',
    Donations = 'Donations',
    Footprints = 'Footprints',
}

export interface CollectionKeys {
    NFTs: string[]
    Donations: string[]
    Footprints: string[]
}
export interface Patch {
    unListedCollections: Record<string, CollectionKeys>
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
