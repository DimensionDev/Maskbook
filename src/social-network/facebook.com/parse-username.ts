import { geti18nString } from '../../utils/i18n'
import { PersonIdentifier, GroupIdentifier, PostIdentifier } from '../../database/type'
import { GetContext } from '@holoflows/kit/es'

/**
 * @see https://www.facebook.com/help/105399436216001#What-are-the-guidelines-around-creating-a-custom-username?
 * @unstable
 * ! Start to use this in a breaking change!
 */
export function regularUsername(name: string) {
    if (!name) return null
    // Avoid common mistake
    if (name === 'photo.php') return null
    const n = name.toLowerCase().replace(/\./g, '')
    if (n.match(/^[a-z0-9]{5,}$/)) {
        return n
    }
    return null
}
/**
 * Normalize post url
 */
export function getPostUrlAtFacebook(post: PostIdentifier<PersonIdentifier>) {
    const id = post.identifier
    const { postId } = post
    const { userId } = id

    const host = getHostName()
    if (!regularUsername(userId)) throw new TypeError(geti18nString('service_username_invalid'))
    if (parseFloat(userId)) return `${host}/permalink.php?story_fbid=${postId}&id=${userId}`
    return `${host}/${userId}/posts/${postId}`
}
/**
 * Normalize profile url
 */
export function getProfilePageUrlAtFacebook(user: PersonIdentifier | GroupIdentifier) {
    if (user instanceof GroupIdentifier) throw new Error('Not implemented')
    if (user.network !== 'facebook.com') throw new Error('Not implemented')

    const host = getHostName()
    const username = user.userId
    if (!regularUsername(username)) throw new TypeError(geti18nString('service_username_invalid'))
    if (parseFloat(username)) return `${host}/profile.php?id=${username}`
    return `${host}/${username}?fref=pymk`
}
function getHostName() {
    let host = 'https://www.facebook.com'
    // If in background page, we can fetch the url directly.
    if (location.hostname === 'm.facebook.com' || GetContext() === 'background') {
        host = 'https://m.facebook.com'
    }
    return host
}
