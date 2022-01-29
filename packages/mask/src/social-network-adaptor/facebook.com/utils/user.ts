import { bioDescriptionSelector, searchAvatarSelector, searchNickNameSelector } from './selector'
import { collectNodeText } from '../../../utils'

export const getNickName = () => {
    const node = searchNickNameSelector().evaluate()
    if (!node) return ''

    return collectNodeText(node)
}

export const getAvatar = () => {
    const node = searchAvatarSelector().evaluate() as HTMLImageElement
    if (!node) return
    const imageURL = node.getAttribute('xlink:href') ?? ''

    return imageURL.trim()
}

export const getBioDescription = () => {
    if (!location.pathname.includes('profile.php')) return

    const node = bioDescriptionSelector().evaluate()

    if (!node) return ''

    // Only collect text
    return [...node.childNodes]
        .map((each) => {
            if (each.nodeType === document.TEXT_NODE) return (each as Text).nodeValue || ''
            return ''
        })
        .join('')
}

const FACEBOOK_AVATAR_ID_MATCH = /(\w+).(?:png|jpg|gif|bmp)/

export const getAvatarId = (avatarURL: string) => {
    if (!avatarURL) return ''
    const _url = new URL(avatarURL)
    const match = _url.pathname.match(FACEBOOK_AVATAR_ID_MATCH)
    if (!match) return ''
    return match[1]
}
