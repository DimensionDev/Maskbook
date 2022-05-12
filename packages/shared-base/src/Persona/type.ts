import type { PersonaIdentifier, ProfileIdentifier } from '../Identifier'
import type { NextIDPersonaBindings } from '../NextID/type'
/**
 * This interface contains the minimal information for UI display
 */
export interface PersonaInformation {
    proof?: NextIDPersonaBindings
    /** The nickname of the persona. Should use profile.nickname if it presents. */
    nickname?: string
    identifier: PersonaIdentifier
    linkedProfiles: ProfileInformation[]
}
export interface ProfileInformation {
    [index: string]: unknown
    /** The nickname of the profile. Should be used in prior. */
    nickname?: string
    avatar?: string
    identifier: ProfileIdentifier
    fingerprint?: string
    address?: string
    fromNextID?: boolean
    publicHexKey?: string
    linkedTwitterNames?: string[]
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
    profile: ProfileIdentifier
    linked: PersonaIdentifier
    favor: RelationFavor
    network: string
}
