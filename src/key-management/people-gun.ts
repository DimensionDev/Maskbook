import tasks from '../extension/content-script/tasks'
import { verifyOthersProve } from '../extension/background-script/CryptoService'
import { sleep } from '../utils/utils'
import { getProfilePageUrlAtFacebook } from '../social-network-provider/facebook.com/parse-username'
import { geti18nString } from '../utils/i18n'
import { PersonIdentifier, PostIdentifier, PersonUI } from '../database/type'
import { queryPerson } from '../database'
import { gun } from '../network/gun/version.1'
import { fetchFacebookBio } from '../social-network-provider/facebook.com/fetch-bio'
import getCurrentNetworkWorker from '../social-network/utils/getCurrentNetworkWorker'

export async function queryPersonFromGun(username: string) {
    return gun
        .get('users')
        .get(username)
        .once().then!()
}
async function getActiveTab() {
    const [tab] = await browser.tabs.query({ active: true })
    if (tab) return tab.id
    return undefined
}
export async function addPersonPublicKey(user: PersonIdentifier): Promise<PersonUI> {
    // ? Try to execute query in the extension environment
    // ? If it is the true extension environment (Chrome, Firefox, GeckoView)
    // ? Will go through this path
    // ? If it it the fake extension environment (Webview on iOS)
    // ? this will fail due to cross-origin restriction.

    // ? if failed
    // ? we go to the old way.
    // ? Invoke a task on the current activating page.
    const fromBio = async () => {
        async function getBio() {
            try {
                return fetchFacebookBio(user)
            } catch {
                const tabId = await getActiveTab()
                return tasks(getProfilePageUrlAtFacebook(user), { runAtTabID: tabId }).getBioContent(user)
            }
        }
        if (!(await verifyOthersProve(await getBio(), user))) {
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
