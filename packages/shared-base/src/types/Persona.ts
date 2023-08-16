import type { PersonaIdentifier, ProfileIdentifier } from '@masknet/base'
import type { NextIDPersonaBindings, NextIDPlatform } from '../NextID/types.js'
/**
 * This interface contains the minimal information for UI display
 */
export interface PersonaInformation {
    avatar?: string
    proof?: NextIDPersonaBindings
    /** The nickname of the persona. Should use profile.nickname if it presents. */
    nickname?: string
    /** The evm address of persona */
    address?: string
    identifier: PersonaIdentifier
    linkedProfiles: ProfileInformation[]
}

export interface ProfileInformation {
    /** The nickname of the profile. Should be used in prior. */
    nickname?: string
    avatar?: string
    identifier: ProfileIdentifier
    linkedPersona?: PersonaIdentifier
    createAt?: Date
}

export interface ProfileAccount extends ProfileInformation {
    is_valid?: boolean
    identity?: string
    platform?: NextIDPlatform
    last_checked_at?: string
}

export interface ProfileInformationFromNextID extends ProfileInformation {
    fromNextID: boolean
    linkedTwitterNames?: string[]
    walletAddress?: string
    createdAt?: Date
    updatedAt?: Date
}

export enum RelationFavor {
    COLLECTED = -1,
    UNCOLLECTED = 1,
    DEPRECATED = 0,
}
export interface RelationProfile {
    favorite?: boolean
    avatar?: string
    name: string
    fingerprint?: string
    identifier: ProfileIdentifier
}

export interface Relation {
    profile: ProfileIdentifier | PersonaIdentifier
    linked: PersonaIdentifier
    favor: RelationFavor
    network?: string
}

export enum ProofType {
    Persona = 'persona',
    EOA = 'eoa',
}

export interface ProofPayload {
    ownerAddress: string
    nonce?: number
}

export interface Proof {
    publicKey: string
    type: ProofType
    payload: string // JSON.stringify(payload)
    signature: string
}
