import { GunAPI as Gun2 } from '../../../network/gun'
import { ProfileIdentifier, PostIdentifier } from '../../../database/type'
import { getNetworkWorker } from '../../../social-network'
import { verifyOthersProve } from './verifyOthersProve'
import { memoizePromise } from '../../../utils/memoize'
import { queryPersonaRecord } from '../../../database'
import type { PersonaRecord } from '../../../database/Persona/Persona.db'
import { i18n } from '../../../utils/i18n-next'

async function getUserPublicKeyFromBio(user: ProfileIdentifier) {
    const profile = await (await getNetworkWorker(user)).tasks.fetchProfile!(user)
    if (!(await verifyOthersProve(profile.bioContent, user))) {
        throw new Error('Not in bio!')
    }
}
async function getUserPublicKeyFromProvePost(user: ProfileIdentifier) {
    const profile = await Gun2.queryPersonFromGun2(user)
    const proverPostID = profile?.provePostId as string | '' | undefined
    if (!proverPostID?.length) {
        throw new Error('Not in gun!')
    }
    const postId = new PostIdentifier(user, proverPostID)
    const post = await (await getNetworkWorker(user)).tasks.fetchPostContent!(postId)
    if ((await verifyOthersProve(post, user)) === false) throw new Error('Not in prove post!')
}
async function getUserPublicKeyFromNetwork(user: ProfileIdentifier) {
    let bioRejected = false
    let proveRejected = false
    const errors: Error[] = []
    const [bio, post] = [getUserPublicKeyFromBio(user), getUserPublicKeyFromProvePost(user)]
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
    const person = await queryPersonaRecord(user)
    if ((bioRejected && proveRejected) || !person?.publicKey) {
        throw new Error(i18n.t('service_others_key_not_found', { name: user.userId }))
    }
    return person
}
Object.assign(globalThis, { getUserPublicKeyFromBio, getUserPublicKeyFromProvePost, getUserPublicKeyFromNetwork })

/**
 * Fetch a user's public key from bio or prove post
 * @param user Identifier
 */
export const addPerson = memoizePromise(
    async function (user: ProfileIdentifier): Promise<PersonaRecord> {
        const person = await queryPersonaRecord(user)
        if (!person?.publicKey) return getUserPublicKeyFromNetwork(user)
        return person
    },
    (id) => id.toText(),
)
