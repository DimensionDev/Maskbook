import type { IdentifierMap } from '@masknet/shared-base'
import { createTransaction } from '../utils/openDB'
import { createAvatarDBAccess, deleteAvatarsDB, IdentifierWithAvatar, queryAvatarOutdatedDB } from './db'

export async function cleanAvatarDB(anotherList: IdentifierMap<IdentifierWithAvatar, undefined>) {
    const t = createTransaction(await createAvatarDBAccess(), 'readwrite')('avatars', 'metadata')
    const outdated = await queryAvatarOutdatedDB(t, 'lastAccessTime')
    for (const each of outdated) {
        anotherList.set(each, undefined)
    }
    await deleteAvatarsDB(t, Array.from(anotherList.keys()))
}
