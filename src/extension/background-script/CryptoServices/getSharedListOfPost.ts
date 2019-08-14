import * as Alpha40 from '../../../crypto/crypto-alpha-40'
import * as Alpha39 from '../../../crypto/crypto-alpha-39'
import * as Gun1 from '../../../network/gun/version.1'
import * as Gun2 from '../../../network/gun/version.2'
import { Person, queryPerson } from '../../../database'
import { PersonIdentifier, PostIdentifier } from '../../../database/type'
import { queryPostDB } from '../../../database/post'
//#endregion
//#region Append Recipients in future
/**
 * Get already shared target of the post
 * @param postSalt
 */
export async function getSharedListOfPost(postSalt: string, postBy: PersonIdentifier): Promise<Person[]> {
    const nameInDB =
        ((await queryPostDB(new PostIdentifier(postBy, postSalt.replace(/\//g, '|')))) || { recipients: [] })
            .recipients || []
    // ! todo: gun 1
    const post = await Gun1.gun1
        .get('posts')
        .get(postSalt)
        .once().then!()
    if (!post) return []
    delete post._
    const nameInGun = Object.keys(post)
    const names = new Set(nameInGun)
    nameInDB.forEach(x => names.add(x.userId))
    return Promise.all([...names.values()].map(x => new PersonIdentifier(postBy.network, x)).map(queryPerson))
}
