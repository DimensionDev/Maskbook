import type { PersonaIdentifier, ProfileIdentifier } from '..'

/**
 * This interface contains the minimal information for UI display
 */
export interface PersonaInformation {
    /** The nickname of the persona. Should use profile.nickname if it presents. */
    nickname?: string
    identifier: PersonaIdentifier
    linkedProfiles: ProfileInformation[]
}
export interface ProfileInformation {
    /** The nickname of the profile. Should be used in prior. */
    nickname?: string
    identifier: ProfileIdentifier
}
