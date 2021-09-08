import * as bip39 from 'bip39'
import { decode, encode } from '@msgpack/msgpack'
import { blobToArrayBuffer, decodeArrayBuffer as decodeArray, encodeArrayBuffer } from '@dimensiondev/kit'
import {
    createPersonaByJsonWebKey,
    personaRecordToPersona,
    queryAvatarDataURL,
    queryPersona,
    queryPersonaRecord,
    queryPostPagedDB,
    queryProfile,
    queryProfilesWithQuery,
    storeAvatar,
} from '../../database'
import {
    ECKeyIdentifier,
    ECKeyIdentifierFromJsonWebKey,
    Identifier,
    PersonaIdentifier,
    ProfileIdentifier,
} from '../../database/type'
import type { Persona, Profile } from '../../database/Persona/types'
import {
    attachProfileDB,
    consistentPersonaDBWriteAccess,
    createOrUpdateProfileDB,
    createProfileDB,
    createRelationDB,
    deleteProfileDB,
    LinkedProfileDetails,
    ProfileRecord,
    queryPersonaDB,
    queryPersonasDB,
    queryProfilesDB,
    queryRelationsPagedDB,
    RelationRecord,
    updateRelationDB,
} from '../../database/Persona/Persona.db'
import { BackupJSONFileLatest, UpgradeBackupJSONFile } from '../../utils/type-transform/BackupFormat/JSON/latest'
import { restoreBackup } from './WelcomeServices/restoreBackup'
import { restoreNewIdentityWithMnemonicWord } from './WelcomeService'
import { decodeArrayBuffer, decodeText } from '../../utils/type-transform/String-ArrayBuffer'
import { decompressBackupFile } from '../../utils/type-transform/BackupFileShortRepresentation'

import { assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import type { EC_JsonWebKey, EC_Private_JsonWebKey, PersonaInformation, ProfileInformation } from '@masknet/shared'
import { getCurrentPersonaIdentifier } from './SettingsService'
import { recover_ECDH_256k1_KeyPair_ByMnemonicWord_V2 } from '../../utils/mnemonic-code'
import { MaskMessage } from '../../utils'
import type { PostIVIdentifier } from '@masknet/shared-base'
import { split_ec_k256_keypair_into_pub_priv } from '../../modules/CryptoAlgorithm/helper'
import { first, orderBy } from 'lodash-es'

assertEnvironment(Environment.ManifestBackground)

export { validateMnemonic } from '../../utils/mnemonic-code'
export { storeAvatar, queryAvatarDataURL } from '../../database'

//#region Profile
export { queryProfile, queryProfilePaged } from '../../database'

export function queryProfiles(network?: string): Promise<Profile[]> {
    return queryProfilesWithQuery(network)
}

export function queryProfilesWithIdentifiers(identifiers: ProfileIdentifier[]) {
    return queryProfilesWithQuery((record) => identifiers.some((x) => record.identifier.equals(x)))
}
export async function queryMyProfiles(network?: string): Promise<Profile[]> {
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
export {
    queryPersona,
    createPersonaByMnemonic,
    createPersonaByMnemonicV2,
    renamePersona,
    queryPrivateKey,
} from '../../database'

export async function queryPersonaByMnemonic(mnemonic: string, password: '') {
    const { key } = await recover_ECDH_256k1_KeyPair_ByMnemonicWord_V2(mnemonic, password)
    const identifier = ECKeyIdentifierFromJsonWebKey(key.privateKey, 'private')
    return queryPersonaDB(identifier)
}
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

export async function queryLastPersonaCreated() {
    const all = await queryPersonas(undefined, true)
    return first(orderBy(all, (x) => x.createdAt, 'desc'))
}

export async function backupPersonaPrivateKey(
    identifier: PersonaIdentifier,
): Promise<EC_Private_JsonWebKey | undefined> {
    const x = await queryPersonaDB(identifier)
    return x?.privateKey
}

export async function queryOwnedPersonaInformation(): Promise<PersonaInformation[]> {
    const personas = await queryPersonas(undefined, true)
    const result: PersonaInformation[] = []
    for (const persona of personas.sort((a, b) => (a.updatedAt > b.updatedAt ? 1 : -1))) {
        const map: ProfileInformation[] = []
        result.push({
            nickname: persona.nickname,
            identifier: persona.identifier,
            linkedProfiles: map,
        })
        for (const [profile] of persona.linkedProfiles) {
            const nickname = (await queryProfile(profile)).nickname
            map.push({ identifier: profile, nickname })
        }
    }
    return result
}
export async function restoreFromObject(object: null | BackupJSONFileLatest): Promise<Persona | null> {
    if (!object) return null
    await restoreBackup(object)
    if (object?.personas?.length) {
        return queryPersona(Identifier.fromString(object.personas[0].identifier, ECKeyIdentifier).unwrap())
    }
    return null
}
export async function restoreFromMnemonicWords(
    mnemonicWords: string,
    nickname: string,
    password: string,
): Promise<Persona> {
    if (!bip39.validateMnemonic(mnemonicWords)) throw new Error('the mnemonic words are not valid')
    const identifier = await restoreNewIdentityWithMnemonicWord(mnemonicWords, password, {
        nickname,
    })

    return queryPersona(identifier)
}
export async function restoreFromBase64(base64: string): Promise<Persona | null> {
    return restoreFromObject(JSON.parse(decodeText(decodeArrayBuffer(base64))) as BackupJSONFileLatest)
}
export async function restoreFromBackup(backup: string): Promise<Persona | null> {
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

//#region Post
export { queryPostsDB } from '../../database'

export async function queryPagedPostHistory(
    options: {
        network: string
        after?: PostIVIdentifier
    },
    count: number,
) {
    const currentPersona = await getCurrentPersonaIdentifier()
    if (currentPersona) {
        return queryPostPagedDB(currentPersona, options, count)
    }

    return []
}
//#endregion

//#region Relation
export async function createNewRelation(profile: ProfileIdentifier, linked: PersonaIdentifier) {
    await consistentPersonaDBWriteAccess(async (t) => createRelationDB({ profile, linked, favor: 0 }, t))
}

export async function queryRelationPaged(
    options: {
        network: string
        after?: RelationRecord
    },
    count: number,
): Promise<RelationRecord[]> {
    const currentPersona = await getCurrentPersonaIdentifier()
    if (currentPersona) {
        return queryRelationsPagedDB(currentPersona, options, count)
    }

    return []
}

export async function updateRelation(profile: ProfileIdentifier, linked: PersonaIdentifier, favor: 0 | 1) {
    await consistentPersonaDBWriteAccess((t) =>
        updateRelationDB(
            {
                profile,
                linked,
                favor,
            },
            t,
        ),
    )
}
//#endregion
/**
 * In older version of Mask, identity is marked as `ProfileIdentifier(network, '$unknown')` or `ProfileIdentifier(network, '$self')`. After upgrading to the newer version of Mask, Mask will try to find the current user in that network and call this function to replace old identifier into a "resolved" identity.
 * @param identifier The resolved identity
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
        await consistentPersonaDBWriteAccess(async (t) => {
            await createProfileDB(final, t)
            await deleteProfileDB(unknown, t).catch(() => {})
            await deleteProfileDB(self, t).catch(() => {})
        })
    } catch {
        // the profile already exists
    }
}
//#endregion

//#region avatar
export const updateCurrentPersonaAvatar = async (avatar: Blob) => {
    const identifier = await getCurrentPersonaIdentifier()

    if (identifier) {
        await storeAvatar(identifier, await blobToArrayBuffer(avatar))
        MaskMessage.events.personaAvatarChanged.sendToAll({ reason: 'update', of: identifier?.toText() })
    }
}

export const getCurrentPersonaAvatar = async () => {
    const identifier = await getCurrentPersonaIdentifier()
    if (!identifier) return null

    try {
        return await queryAvatarDataURL(identifier)
    } catch {
        return null
    }
}
//#endregion

//#region Private / Public key
export async function exportPersonaPrivateKey(identifier: PersonaIdentifier) {
    const profile = await queryPersonaRecord(identifier)
    if (!profile?.privateKey) return ''

    const encodePrivateKey = encode(profile.privateKey)
    return encodeArrayBuffer(encodePrivateKey)
}

export async function queryPersonaByPrivateKey(privateKeyString: string) {
    const privateKey = decode(decodeArray(privateKeyString)) as EC_JsonWebKey
    const identifier = ECKeyIdentifierFromJsonWebKey(privateKey, 'public')

    const persona = await queryPersonaDB(identifier)
    if (persona) return personaRecordToPersona(persona)

    return null
}

export async function createPersonaByPrivateKey(privateKeyString: string, nickname: string) {
    const privateKey = decode(decodeArray(privateKeyString)) as EC_JsonWebKey
    const key = await split_ec_k256_keypair_into_pub_priv(privateKey)

    return createPersonaByJsonWebKey({ privateKey: key.privateKey, publicKey: key.publicKey, nickname })
}
//#endregion

export * from './IdentityServices/sign'
