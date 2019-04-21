import { queryPersonCryptoKey, PersonCryptoKey } from './keystore-db'
import { gun } from './gun'
import tasks from '../extension/content-script/tasks'
import { verifyOthersProve } from '../extension/background-script/CryptoService'
import { sleep } from '../utils/utils'

export async function queryPersonFromGun(username: string) {
    return gun
        .get('users')
        .get(username)
        .once().then!()
}

export async function addPersonPublicKey(username: string): Promise<PersonCryptoKey> {
    const hasUsername = !username.match(/^\d+$/)
    const bioUrl = hasUsername
        ? `https://www.facebook.com/${username}?fref=pymk`
        : `https://www.facebook.com/profile.php?id=${username}`
    const postUrl = (postId: string) =>
        hasUsername
            ? `https://www.facebook.com/${username}/posts/${postId}`
            : `https://www.facebook.com/permalink.php?story_fbid=${postId}&id=${username}`

    const fromBio = async () => {
        const bio = await tasks(bioUrl).getBioContent()
        if ((await verifyOthersProve(bio, username)) === null) throw new Error('Not in bio!')
    }
    const fromPost = async () => {
        const person = await queryPersonFromGun(username)
        if (!person) throw new Error('Not in gun!')
        const post = await tasks(postUrl(person.provePostId)).getPostContent()
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
        throw new Error('Cannot find public key of ' + username)
    }
    return key
}

export async function uploadProvePostUrl(username: string, postId: string) {
    if (!postId) return
    return gun.get('users').put({ [username]: { provePostId: postId } }).then!()
}
Object.assign(window, { queryPersonFromGun, uploadProvePostUrl, addKey: addPersonPublicKey })
