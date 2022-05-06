import { createTransaction } from '../utils/openDB'
import { createAvatarDBAccess, deleteAvatarsDB, IdentifierWithAvatar, queryAvatarOutdatedDB } from './db'

export async function cleanAvatarDB(anotherList: Set<IdentifierWithAvatar>) {
    const t = createTransaction(await createAvatarDBAccess(), 'readwrite')('avatars', 'metadata')
    const outdated = await queryAvatarOutdatedDB(t, 'lastAccessTime')
    for (const each of outdated) {
        anotherList.add(each)
    }
    await deleteAvatarsDB(t, Array.from(anotherList.keys()))
}
