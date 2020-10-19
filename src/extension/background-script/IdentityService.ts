import * as bip39 from 'bip39'
import { queryProfilesWithQuery, personaRecordToPersona, storeAvatar, queryProfile } from '../../database'
import { ProfileIdentifier, PersonaIdentifier, Identifier, ECKeyIdentifier } from '../../database/type'
import type { Profile, Persona } from '../../database/Persona/types'
import {
    queryPersonaDB,
    deleteProfileDB,
    queryPersonasDB,
    queryProfilesDB,
    createProfileDB,
    attachProfileDB,
    LinkedProfileDetails,
    ProfileRecord,
    createOrUpdateProfileDB,
    consistentPersonaDBWriteAccess,
} from '../../database/Persona/Persona.db'
import { queryPersona } from '../../database'
import { OnlyRunInContext } from '@dimensiondev/holoflows-kit/es'
import { BackupJSONFileLatest, UpgradeBackupJSONFile } from '../../utils/type-transform/BackupFormat/JSON/latest'
import { restoreBackup } from './WelcomeServices/restoreBackup'
import { restoreNewIdentityWithMnemonicWord } from './WelcomeService'
import { decodeText, decodeArrayBuffer } from '../../utils/type-transform/String-ArrayBuffer'
import { decompressBackupFile } from '../../utils/type-transform/BackupFileShortRepresentation'

OnlyRunInContext(['background', 'debugging'], 'IdentityService')

//#region Avatars
export { storeAvatar, getAvatarDataURL as queryAvatarDataURL } from '../../database'
//#endregion

//#region Profile
export { queryProfile, queryProfilePaged } from '../../database'

export function queryProfiles(network?: string): Promise<Profile[]> {
    return queryProfilesWithQuery(network)
}
export async function queryMyProfiles(network?: string) {
    const myPersonas = (await queryMyPersonas(network)).filter((x) => !x.uninitialized)
    return Promise.all(
        myPersonas
            .flatMap((x) => Array.from(x.linkedProfiles.keys()))
            .filter((y) => !network || network === y.network)
            .map(queryProfile),
    )
}
export async function updateProfileInfo(
    identifier: ProfileIdentifier,
    data: {
        nickname?: string | null
        avatarURL?: string | null
        forceUpdateAvatar?: boolean
    },
): Promise<void> {
    if (data.nickname) {
        const rec: ProfileRecord = {
            identifier,
            nickname: data.nickname,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        await consistentPersonaDBWriteAccess((t) => createOrUpdateProfileDB(rec, t))
    }
    if (data.avatarURL) await storeAvatar(identifier, data.avatarURL, data.forceUpdateAvatar)
}
export function removeProfile(id: ProfileIdentifier): Promise<void> {
    return consistentPersonaDBWriteAccess((t) => deleteProfileDB(id, t))
}
//#endregion

//#region Persona
export { queryPersona, createPersonaByMnemonic, renamePersona } from '../../database'
export async function queryPersonas(identifier?: PersonaIdentifier, requirePrivateKey = false): Promise<Persona[]> {
    if (typeof identifier === 'undefined')
        return (await queryPersonasDB((k) => (requirePrivateKey ? !!k.privateKey : true))).map(personaRecordToPersona)
    const x = await queryPersonaDB(identifier)
    if (!x || (!x.privateKey && requirePrivateKey)) return []
    return [personaRecordToPersona(x)]
}
export function queryMyPersonas(network?: string): Promise<Persona[]> {
    return queryPersonas(undefined, true).then((x) =>
        typeof network === 'string'
            ? x.filter((y) => {
                  for (const z of y.linkedProfiles.keys()) {
                      if (z.network === network) return true
                  }
                  return false
              })
            : x,
    )
}
export async function restoreFromObject(object: null | BackupJSONFileLatest) {
    if (!object) return null
    await restoreBackup(object)
    if (object?.personas?.length) {
        return queryPersona(Identifier.fromString(object.personas[0].identifier, ECKeyIdentifier).unwrap())
    }
    return null
}
export async function restoreFromMnemonicWords(mnemonicWords: string, nickname: string, password: string) {
    if (!bip39.validateMnemonic(mnemonicWords)) throw new Error('the mnemonic words are not valid')
    const identifier = await restoreNewIdentityWithMnemonicWord(mnemonicWords, password, {
        nickname,
    })
    return queryPersona(identifier)
}
export async function restoreFromBase64(base64: string) {
    return restoreFromObject(JSON.parse(decodeText(decodeArrayBuffer(base64))) as BackupJSONFileLatest)
}
export async function restoreFromBackup(backup: string) {
    return restoreFromObject(UpgradeBackupJSONFile(decompressBackupFile(backup)))
}
//#endregion

//#region Profile & Persona
/**
 * Remove an identity.
 */
export { setupPersona, deletePersona } from '../../database'
export async function attachProfile(
    source: ProfileIdentifier,
    target: ProfileIdentifier | PersonaIdentifier,
    data: LinkedProfileDetails,
): Promise<void> {
    if (target instanceof ProfileIdentifier) {
        const profile = await queryProfile(target)
        if (!profile.linkedPersona) throw new Error('target not found')
        target = profile.linkedPersona.identifier
    }
    return attachProfileDB(source, target, data)
}
export { detachProfileDB as detachProfile } from '../../database/Persona/Persona.db'
//#endregion

/**
 * Resolve my possible identity
 */
export async function resolveIdentity(identifier: ProfileIdentifier): Promise<void> {
    const unknown = new ProfileIdentifier(identifier.network, '$unknown')
    const self = new ProfileIdentifier(identifier.network, '$self')

    const r = await queryProfilesDB((x) => x.identifier.equals(unknown) || x.identifier.equals(self))
    if (!r.length) return
    const final = {
        ...r.reduce((p, c) => ({ ...p, ...c })),
        identifier,
    }
    try {
        consistentPersonaDBWriteAccess(async (t) => {
            await createProfileDB(final, t as any)
            await deleteProfileDB(unknown, t).catch(() => {})
            await deleteProfileDB(self, t).catch(() => {})
        })
    } catch {
        // the profile already exists
    }
}
