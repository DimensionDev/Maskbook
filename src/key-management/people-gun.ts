import { queryPersonCryptoKey, PersonCryptoKey } from './keystore-db'
import { gun } from './gun'
import tasks from '../extension/content-script/tasks'
import { verifyOthersProve } from '../extension/background-script/CryptoService'
import { sleep } from '../utils/utils'
import { getProfilePageUrl, getPostUrl } from '../utils/type-transform/Username'
import { geti18nString } from '../utils/i18n'

export async function queryPersonFromGun(username: string) {
    return gun
        .get('users')
        .get(username)
        .once().then!()
}

export async function addPersonPublicKey(username: string): Promise<PersonCryptoKey> {
    const fromBio = async () => {
        const bio = await tasks(getProfilePageUrl(username)).getBioContent()
        if ((await verifyOthersProve(bio, username)) === null) throw new Error('Not in bio!')
    }
    const fromPost = async () => {
        const person = await queryPersonFromGun(username)
        if (!person || !person.provePostId) throw new Error('Not in gun!')
        const post = await tasks(getPostUrl(username, person.provePostId)).getPostContent()
        if ((await verifyOthersProve(post, username)) === null) throw new Error('Not in prove post!')
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
    const key = await queryPersonCryptoKey(username)
    if ((bioRejected && proveRejected) || !key) {
        console.error(...errors)
        throw new Error(geti18nString('service-others-key-not-found', username))
    }
    return key
}

export async function uploadProvePostUrl(username: string, postId: string) {
    if (!postId) return
    return gun.get('users').put({ [username]: { provePostId: postId } }).then!()
}
Object.assign(window, { queryPersonFromGun, uploadProvePostUrl, addKey: addPersonPublicKey })
