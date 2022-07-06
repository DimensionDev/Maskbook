import {
    decompressSecp256k1Key,
    ECKeyIdentifier,
    NextIDAction,
    PersonaIdentifier,
    ProfileIdentifier,
    ProfileInformationFromNextID,
    RelationFavor,
} from '@masknet/shared-base'
import { MaskMessages } from '../../../../shared/messages'
import { storeAvatar } from '../../../database/avatar-cache/avatar'
import {
    attachProfileDB,
    consistentPersonaDBWriteAccess,
    createOrUpdateProfileDB,
    createProfileDB,
    deleteProfileDB,
    detachProfileDB,
    LinkedProfileDetails,
    PersonaRecord,
    ProfileRecord,
    queryProfileDB,
    queryProfilesDB,
} from '../../../database/persona/db'
import { NextIDProof } from '@masknet/web3-providers'
import { createOrUpdatePersonaDB, createOrUpdateRelationDB } from '../../../database/persona/web'

export interface UpdateProfileInfo {
    nickname?: string | null
    avatarURL?: string | null
}
export async function updateProfileInfo(identifier: ProfileIdentifier, data: UpdateProfileInfo): Promise<void> {
    if (data.nickname) {
        const rec: ProfileRecord = {
            identifier,
            nickname: data.nickname,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        await consistentPersonaDBWriteAccess((t) => createOrUpdateProfileDB(rec, t))
    }
    if (data.avatarURL) await storeAvatar(identifier, data.avatarURL)
}

export function mobile_removeProfile(id: ProfileIdentifier): Promise<void> {
    if (process.env.architecture !== 'app') throw new TypeError('This function is only available in app')
    return consistentPersonaDBWriteAccess((t) => deleteProfileDB(id, t))
}

export async function detachProfileWithNextID(
    uuid: string,
    personaPublicKey: string,
    platform: string,
    identity: string,
    createdAt: string,
    options?: { signature?: string },
): Promise<void> {
    await NextIDProof.bindProof(uuid, personaPublicKey, NextIDAction.Delete, platform, identity, createdAt, {
        signature: options?.signature,
    })
    MaskMessages.events.ownProofChanged.sendToAll(undefined)
}
/**
 * In older version of Mask, identity is marked as `ProfileIdentifier(network, '$unknown')` or `ProfileIdentifier(network, '$self')`. After upgrading to the newer version of Mask, Mask will try to find the current user in that network and call this function to replace old identifier into a "resolved" identity.
 * @param identifier The resolved identity
 */
export async function resolveUnknownLegacyIdentity(identifier: ProfileIdentifier): Promise<void> {
    const unknown = ProfileIdentifier.of(identifier.network, '$unknown').unwrap()
    const self = ProfileIdentifier.of(identifier.network, '$self').unwrap()

    const records = await queryProfilesDB({ identifiers: [unknown, self] })
    if (!records.length) return
    const finalRecord: ProfileRecord = Object.assign({}, ...records, { identifier })
    try {
        await consistentPersonaDBWriteAccess(async (t) => {
            await createProfileDB(finalRecord, t)
            await deleteProfileDB(unknown, t).catch(() => {})
            await deleteProfileDB(self, t).catch(() => {})
        })
    } catch {
        // the profile already exists
    }
}

/**
 * Remove an identity.
 */
export async function attachProfile(
    source: ProfileIdentifier,
    target: ProfileIdentifier | PersonaIdentifier,
    data: LinkedProfileDetails,
): Promise<void> {
    if (target instanceof ProfileIdentifier) {
        const profile = await queryProfileDB(target)
        if (!profile?.linkedPersona) throw new Error('target not found')
        target = profile.linkedPersona
    }
    return attachProfileDB(source, target, data)
}
export function detachProfile(identifier: ProfileIdentifier): Promise<void> {
    return detachProfileDB(identifier)
}

/**
 * Set NextID profile to profileDB
 * */

export async function attachNextIDPersonaToProfile(item: ProfileInformationFromNextID, whoAmI: ECKeyIdentifier) {
    if (!item.linkedPersona) throw new Error('LinkedPersona Not Found')
    const personaRecord: PersonaRecord = {
        createdAt: new Date(),
        updatedAt: new Date(),
        identifier: item.linkedPersona,
        linkedProfiles: new Map(),
        publicKey: await decompressSecp256k1Key(item.linkedPersona.rawPublicKey),
        publicHexKey: item.linkedPersona?.publicKeyAsHex,
        nickname: item.nickname,
        hasLogout: false,
        uninitialized: false,
    }

    const profileRecord: ProfileRecord = {
        identifier: item.identifier,
        nickname: item.nickname,
        linkedPersona: item.linkedPersona,
        createdAt: new Date(),
        updatedAt: new Date(),
    }
    try {
        await consistentPersonaDBWriteAccess(async (t) => {
            await createOrUpdatePersonaDB(
                personaRecord,
                { explicitUndefinedField: 'ignore', linkedProfiles: 'merge' },
                t,
            )
            await createOrUpdateProfileDB(profileRecord, t)
            await attachProfileDB(
                profileRecord.identifier,
                item.linkedPersona!,
                { connectionConfirmState: 'confirmed' },
                t,
            )
            await createOrUpdateRelationDB(
                {
                    profile: profileRecord.identifier,
                    linked: whoAmI,
                    favor: RelationFavor.UNCOLLECTED,
                },
                t,
            )
        })
    } catch {
        // already exist
    }
}
