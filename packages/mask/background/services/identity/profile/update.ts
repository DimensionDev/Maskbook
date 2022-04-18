import { NextIDAction, ProfileIdentifier } from '@masknet/shared-base'
import { MaskMessages } from '../../../../shared/messages'
import { storeAvatar } from '../../../database/avatar-cache/avatar'
import {
    consistentPersonaDBWriteAccess,
    createOrUpdateProfileDB,
    createProfileDB,
    deleteProfileDB,
    ProfileRecord,
    queryProfilesDB,
} from '../../../database/persona/db'
import { NextIDProof } from '@masknet/web3-providers'

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
    const unknown = new ProfileIdentifier(identifier.network, '$unknown')
    const self = new ProfileIdentifier(identifier.network, '$self')

    const r = await queryProfilesDB({ identifiers: [unknown, self] })
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
