import { ProfileIdentifier, GroupIdentifier, PostIdentifier } from '../../database/type'
import { isMobileFacebook } from './isMobile'
import { i18n } from '../../utils/i18n-next'

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
export function getPostUrlAtFacebook(post: PostIdentifier<ProfileIdentifier>, usage: 'fetch' | 'open') {
    const id = post.identifier
    const { postId } = post
    const { userId } = id

    const host = getFacebookHostName(usage)
    if (!regularUsername(userId)) throw new TypeError(i18n.t('service_username_invalid'))
    if (parseFloat(userId)) return `${host}/permalink.php?story_fbid=${postId}&id=${userId}`
    return `${host}/${userId}/posts/${postId}`
}
/**
 * Normalize profile url
 */
export function getProfilePageUrlAtFacebook(user: ProfileIdentifier | GroupIdentifier, usage: 'fetch' | 'open') {
    if (user instanceof GroupIdentifier) throw new Error('Not implemented')
    if (user.network !== 'facebook.com') throw new Error('Wrong origin')

    const host = getFacebookHostName(usage)
    const username = user.userId
    if (!regularUsername(username)) throw new TypeError(i18n.t('service_username_invalid'))
    if (parseFloat(username)) return `${host}/profile.php?id=${username}`
    return `${host}/${username}`
}
export function getFacebookHostName(usage: 'fetch' | 'open') {
    if (isMobileFacebook) return 'https://m.facebook.com'
    return 'https://www.facebook.com'
}
