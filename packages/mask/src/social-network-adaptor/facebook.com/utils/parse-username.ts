import type { ProfileIdentifier, PostIdentifier } from '@masknet/shared-base'
import { isMobileFacebook } from './isMobile'
import { i18n } from '../../../../shared-ui/locales_legacy'

/**
 * @see https://www.facebook.com/help/105399436216001#What-are-the-guidelines-around-creating-a-custom-username?
 * ! Start to use this in a breaking change!
 */
export function isValidFacebookUsername(name: string) {
    if (!name) return null
    // Avoid common mistake
    if (name === 'photo.php') return null
    const n = name.toLowerCase().replace(/\./g, '')
    if (n.match(/^[\da-z]+$/)) {
        return n
    }
    return null
}
/**
 * Normalize post url
 */
export function getPostUrlAtFacebook(post: PostIdentifier<ProfileIdentifier>) {
    const id = post.identifier
    const { postId } = post
    const { userId } = id
    const host = getFacebookHostName()
    if (!isValidFacebookUsername(userId)) return host
    if (Number.parseFloat(userId)) return `${host}/permalink.php?story_fbid=${postId}&id=${userId}`
    return `${host}/${userId}/posts/${postId}`
}
/**
 * Normalize profile url
 */
export function getProfilePageUrlAtFacebook(user: ProfileIdentifier) {
    if (user.network !== 'facebook.com') throw new Error('Wrong origin')

    const host = getFacebookHostName()
    const username = user.userId
    if (!isValidFacebookUsername(username)) throw new TypeError(i18n.t('service_username_invalid'))
    if (Number.parseFloat(username)) return `${host}/profile.php?id=${username}`
    return `${host}/${username}`
}
export function getFacebookHostName() {
    if (isMobileFacebook) return 'https://m.facebook.com'
    return 'https://www.facebook.com'
}
