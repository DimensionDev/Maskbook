// tslint:disable: deprecation
import { PersonIdentifier, PostIdentifier } from '../../../database/type'
import { gun1 } from '.'

/** @deprecated */
export async function queryPersonFromGun(username: string) {
    return gun1
        .get('users')
        .get(username)
        .once().then!()
}

/** @deprecated */
export async function uploadProvePostUrl(post: PostIdentifier<PersonIdentifier>) {
    const { postId, identifier } = post
    if (!(identifier instanceof PersonIdentifier)) return
    const { userId: username } = identifier
    if (!postId) return
    return gun1.get('users').put({ [username]: { provePostId: postId } }).then!()
}
