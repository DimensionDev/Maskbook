import { geti18nString } from '../i18n'

/**
 * @see https://www.facebook.com/help/105399436216001#What-are-the-guidelines-around-creating-a-custom-username?
 * @unstable
 * ! Start to use this in a breaking change!
 */
export function regularUsername(name: string) {
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
export function getPostUrl(username: string, postId: string | number) {
    if (!regularUsername(username)) throw new TypeError(geti18nString('service_username_invalid'))
    if (parseFloat(username)) return `https://www.facebook.com/permalink.php?story_fbid=${postId}&id=${username}`
    return `https://www.facebook.com/${username}/posts/${postId}`
}
/**
 * Normalize profile url
 */
export function getProfilePageUrl(username: string) {
    if (!regularUsername(username)) throw new TypeError(geti18nString('service_username_invalid'))
    if (parseFloat(username)) return `https://www.facebook.com/profile.php?id=${username}`
    return `https://www.facebook.com/${username}?fref=pymk`
}
