import type { ProfileIdentifier, PostIdentifier } from '@masknet/shared-base'
import { i18n } from '../../../../shared-ui/locales_legacy/index.js'

const HOST_NAME = 'https://www.facebook.com'

/**
 * @see https://www.facebook.com/help/105399436216001#What-are-the-guidelines-around-creating-a-custom-username?
 * ! Start to use this in a breaking change!
 */
export function isValidFacebookUsername(name: string) {
    if (!name) return null
    // Avoid common mistake
    if (name === 'photo.php') return null
    const n = name.toLowerCase().replaceAll('.', '')
    if (n.match(/^[\da-z]+$/)) {
        return n
    }
    return null
}
/**
 * Normalize post url
 */
export function getPostUrlAtFacebook(post: PostIdentifier) {
    const id = post.identifier
    const { postId } = post
    const { userId } = id
    if (!isValidFacebookUsername(userId)) return HOST_NAME
    if (Number.parseFloat(userId)) return `${HOST_NAME}/permalink.php?story_fbid=${postId}&id=${userId}`
    return `${HOST_NAME}/${userId}/posts/${postId}`
}
/**
 * Normalize profile url
 */
export function getProfilePageUrlAtFacebook(user: ProfileIdentifier) {
    if (user.network !== 'facebook.com') throw new Error('Wrong origin')

    const username = user.userId
    if (!isValidFacebookUsername(username)) throw new TypeError(i18n.t('service_username_invalid'))
    if (Number.parseFloat(username)) return `${HOST_NAME}/profile.php?id=${username}`
    return `${HOST_NAME}/${username}`
}
