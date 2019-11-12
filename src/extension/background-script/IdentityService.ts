import { queryProfilesWithQuery, personaRecordToPersona, updateOrCreateProfile, storeAvatar } from '../../database'
import { ProfileIdentifier, PersonaIdentifier } from '../../database/type'
import { Profile, Persona } from '../../database/Persona/types'
import { queryPersonaDB, deleteProfileDB, queryPersonasDB } from '../../database/Persona/Persona.db'

export { writePersonOnGun as writeProfileOnGun } from '../../network/gun/version.2/people'

// region Avatars
export { storeAvatar, getAvatarDataURL as queryAvatarDataURL } from '../../database'

//#region Profile
export { queryProfile } from '../../database'
export function queryProfiles(network?: string): Promise<Profile[]> {
    return queryProfilesWithQuery(network)
}
export function updateProfileInfo(
    identifier: ProfileIdentifier,
    data: {
        nickname?: string
        avatarURL?: string
        forceUpdateAvatar?: boolean
    },
): Promise<void> {
    if (data.nickname) return updateOrCreateProfile({ identifier, nickname: data.nickname })
    if (data.avatarURL) return storeAvatar(identifier, data.avatarURL, data.forceUpdateAvatar)
    return Promise.resolve()
}
export function removeProfile(id: ProfileIdentifier): Promise<void> {
    return deleteProfileDB(id)
}
//#endregion

//#region Persona
export { queryPersona } from '../../database'
export async function queryPersonas(identifier?: PersonaIdentifier, requirePrivateKey = false): Promise<Persona[]> {
    if (typeof identifier === 'undefined')
        return (await queryPersonasDB(k => (requirePrivateKey ? !!k.privateKey : true))).map(personaRecordToPersona)
    const x = await queryPersonaDB(identifier)
    if (!x || (!x.privateKey && requirePrivateKey)) return []
    return [personaRecordToPersona(x)]
}
/**
 * Remove an identity.
 */
export { deletePersona } from '../../database'
//#endregion

//#region Profile & Persona
export { attachProfileDB as attachProfile, detachProfileDB as detachProfile } from '../../database/Persona/Persona.db'
//#endregion

/**
 * Restore the backup
 */
export declare function restoreBackup(json: object, whoAmI?: ProfileIdentifier): Promise<void>
/**
 * Resolve my possible identity
 */
export declare function resolveIdentity(identifier: ProfileIdentifier): Promise<void>
