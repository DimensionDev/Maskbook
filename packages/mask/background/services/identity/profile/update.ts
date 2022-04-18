import type { ProfileIdentifier } from '@masknet/shared-base'
import { storeAvatar } from '../../../database/avatar-cache/avatar'
import {
    consistentPersonaDBWriteAccess,
    createOrUpdateProfileDB,
    deleteProfileDB,
    ProfileRecord,
} from '../../../database/persona/db'

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
