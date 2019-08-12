import { PersonUI, PersonIdentifier, PostIdentifier } from '../../../database/type'
import getCurrentNetworkWorker from '../../../social-network/utils/getCurrentNetworkWorker'
import { verifyOthersProve } from '../../../extension/background-script/CryptoService'
import { sleep } from '@holoflows/kit/es/util/sleep'
import { queryPersonDB } from '../../../database/people'
import { geti18nString } from '../../../utils/i18n'
import { gun } from '.'

export async function queryPersonFromGun(username: string) {
    return gun
        .get('users')
        .get(username)
        .once().then!()
}
const fetchKeyCache = new Map<string, Promise<PersonUI>>()
export function addPersonPublicKey(user: PersonIdentifier): Promise<PersonUI> {
    if (fetchKeyCache.has(user.toText())) {
        return fetchKeyCache.get(user.toText())!
    }
    const promise = addPersonPublicKeyImpl(user)
    promise.catch(() => setTimeout(() => fetchKeyCache.delete(user.toText()), 10000))
    fetchKeyCache.set(user.toText(), promise)
    return promise
}
async function addPersonPublicKeyImpl(user: PersonIdentifier): Promise<PersonUI> {
    const fromBio = async () => {
        const profile = await getCurrentNetworkWorker(user).fetchProfile(user)
        if (!(await verifyOthersProve(profile.bioContent, user))) {
            throw new Error('Not in bio!')
        }
    }
    const fromPost = async () => {
        const person = await queryPersonFromGun(user.userId)
        if (!person || !person.provePostId || !person.provePostId.length) throw new Error('Not in gun!')

        const postId = new PostIdentifier(user, person.provePostId)
        const post = await getCurrentNetworkWorker(postId).fetchPostContent(postId)

        if ((await verifyOthersProve(post, user)) === false) throw new Error('Not in prove post!')
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
    const person = await queryPersonDB(user)
    if ((bioRejected && proveRejected) || !person || !person.publicKey) {
        throw new Error(geti18nString('service_others_key_not_found', user.userId))
    }
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
