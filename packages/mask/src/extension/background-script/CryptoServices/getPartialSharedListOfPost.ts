import { Profile, queryProfile } from '../../../database'
import { ProfileIdentifier, Identifier, PostIVIdentifier } from '@masknet/shared-base'
import { queryPostDB } from '../../../../background/database/post'

// #endregion
// #region Append Recipients in future
/**
 * Get already shared target of the post
 * @param postSalt
 */
export async function getPartialSharedListOfPost(
    version: -40 | -39 | -38,
    postSalt: string,
    postBy: ProfileIdentifier,
): Promise<Profile[]> {
    const ids = new Set<string>()
    const nameInDB = (await queryPostDB(new PostIVIdentifier(postBy.network, postSalt)))?.recipients
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
