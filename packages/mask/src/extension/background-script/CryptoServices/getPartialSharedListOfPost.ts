import { Profile, queryProfile } from '../../../database'
import { ProfileIdentifier, Identifier, PostIVIdentifier } from '@masknet/shared-base'
import { queryPostDB } from '../../../../background/database/post'

/**
 * Get already shared target of the post
 */
export async function getPartialSharedListOfPost(id: PostIVIdentifier): Promise<Profile[]> {
    const ids = new Set<string>()
    const nameInDB = (await queryPostDB(id))?.recipients
    if (nameInDB === 'everyone') return []
    if (!nameInDB) return []
    nameInDB.forEach((_, x) => ids.add(x.toText()))
    return Promise.all(
        Array.from(ids)
            .map((x) => Identifier.fromString(x, ProfileIdentifier))
            .filter((x) => x.ok)
            .map((x) => x.val as ProfileIdentifier)
            .map(queryProfile),
    )
}
