import { gun } from './gun'
import tasks from '../extension/content-script/tasks'
import { verifyOthersProve } from '../extension/background-script/CryptoService'
import { sleep } from '../utils/utils'
import { getProfilePageUrlAtFacebook, getPostUrlAtFacebook } from '../utils/type-transform/Username'
import { geti18nString } from '../utils/i18n'
import { PersonIdentifier, PostIdentifier, PersonUI } from '../database/type'
import { queryPerson } from '../database'

export async function queryPersonFromGun(username: string) {
    return gun
        .get('users')
        .get(username)
        .once().then!()
}

export async function addPersonPublicKey(user: PersonIdentifier): Promise<PersonUI> {
    const fromBio = async () => {
        const bio = await tasks(getProfilePageUrlAtFacebook(user)).getBioContent()
        if ((await verifyOthersProve(bio, user)) === null) throw new Error('Not in bio!')
    }
    const fromPost = async () => {
        const person = await queryPersonFromGun(user.userId)
        if (!person || !person.provePostId) throw new Error('Not in gun!')
        const post = await tasks(getPostUrlAtFacebook(new PostIdentifier(user, person.provePostId))).getPostContent()
        if ((await verifyOthersProve(post, user)) === null) throw new Error('Not in prove post!')
    }
    let bioRejected = false
    let proveRejected = false
    const errors = [] as Error[]
    const [bio, post] = [fromBio(), fromPost()]
    try {
        await bio
    } catch (e) {
        errors.push(e)
        bioRejected = true
    }
    try {
        await post
    } catch (e) {
        errors.push(e)
        proveRejected = true
    }
    // HACK
    await sleep(1000)
    const person = await queryPerson(user)
    if ((bioRejected && proveRejected) || !person || !person.publicKey) {
        console.error(...errors)
        throw new Error(geti18nString('service_others_key_not_found', user.userId))
    }
    if (!person.publicKey) throw ''
    return person
}

export async function uploadProvePostUrl(post: PostIdentifier<PersonIdentifier>) {
    const { postId, identifier } = post
    if (!(identifier instanceof PersonIdentifier)) return
    const { userId: username } = identifier
    if (!postId) return
    return gun.get('users').put({ [username]: { provePostId: postId } }).then!()
}
Object.assign(window, { queryPersonFromGun, uploadProvePostUrl, addKey: addPersonPublicKey })
