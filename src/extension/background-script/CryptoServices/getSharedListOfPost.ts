import * as Gun1 from '../../../network/gun/version.1'
import { Person, queryPerson } from '../../../database'
import { PersonIdentifier, PostIdentifier, Identifier } from '../../../database/type'
import { queryPostDB } from '../../../database/post'
//#endregion
//#region Append Recipients in future
/**
 * Get already shared target of the post
 * @param postSalt
 */
export async function getSharedListOfPost(
    version: -40 | -39,
    postSalt: string,
    postBy: PersonIdentifier,
): Promise<Person[]> {
    const ids = new Set<string>()
    const nameInDB =
        ((await queryPostDB(new PostIdentifier(postBy, postSalt.replace(/\//g, '|')))) || { recipients: [] })
            .recipients || []
    nameInDB.forEach(x => ids.add(x.toText()))
    if (version === -40) {
        // tslint:disable-next-line: deprecation
        const post = await Gun1.gun1
            .get('posts')
            .get(postSalt)
            .once().then!()
        if (!post) return []
        delete post._
        const nameInGun = Object.keys(post)
        // ? version 40 is for old facebook only
        nameInGun.forEach(x => new PersonIdentifier('facebook.com', x))
    }
    return Promise.all(
        Array.from(ids)
            .map(x => Identifier.fromString(x) as PersonIdentifier)
            .map(queryPerson),
    )
}
