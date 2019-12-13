import * as Gun1 from '../../../network/gun/version.1'
import { Profile, queryProfile } from '../../../database'
import { ProfileIdentifier, Identifier, PostIVIdentifier } from '../../../database/type'
import { queryPostDB } from '../../../database/post'
//#endregion
//#region Append Recipients in future
/**
 * Get already shared target of the post
 * @param postSalt
 */
export async function getSharedListOfPost(
    version: -40 | -39 | -38,
    postSalt: string,
    postBy: ProfileIdentifier,
): Promise<Profile[]> {
    const ids = new Set<string>()
    const nameInDB = ((await queryPostDB(new PostIVIdentifier(postBy.network, postSalt))) || { recipients: {} })
        .recipients
    Object.keys(nameInDB).forEach(x => ids.add(x))
    if (version === -40) {
        // eslint-disable-next-line import/no-deprecated
        const post = await Gun1.gun1.get('posts').get(postSalt).then!()
        if (!post) return []
        delete post._
        const nameInGun = Object.keys(post)
        // ? version 40 is for old facebook only
        nameInGun.forEach(x => ids.add(new ProfileIdentifier('facebook.com', x).toText()))
    }
    return Promise.all(
        Array.from(ids)
            .map(x => Identifier.fromString(x, ProfileIdentifier).value!)
            .filter(x => x)
            .map(queryProfile),
    )
}
