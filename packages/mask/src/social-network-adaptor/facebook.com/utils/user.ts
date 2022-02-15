import {
    bioDescriptionSelector,
    bioDescriptionSelectorOnMobile,
    searchAvatarSelector,
    searchFacebookAvatarOnMobileSelector,
    searchNickNameSelector,
    searchNickNameSelectorOnMobile,
    searchUserIdSelector,
    searchUserIdSelectorOnMobile,
} from './selector'
import { collectNodeText } from '../../../utils'
import { isMobileFacebook } from './isMobile'

export const getNickName = () => {
    const node = isMobileFacebook ? searchNickNameSelectorOnMobile().evaluate() : searchNickNameSelector().evaluate()
    if (!node) return ''

    return collectNodeText(node)
}

export const getAvatar = () => {
    const node = isMobileFacebook
        ? searchFacebookAvatarOnMobileSelector().evaluate()
        : searchAvatarSelector().evaluate()
    if (!node) return

    const imageURL =
        (isMobileFacebook
            ? node.style.background.match(/\(["']?(.*?)["']?\)/)?.[1]
            : node.getAttribute('xlink:href')) ?? ''

    return imageURL.trim()
}

export const getBioDescription = () => {
    const node = isMobileFacebook ? bioDescriptionSelectorOnMobile().evaluate() : bioDescriptionSelector().evaluate()

    if (!node) return ''

    // Only collect text
    return [...node.childNodes]
        .map((each) => {
            if (each.nodeType === document.TEXT_NODE) return (each as Text).nodeValue || ''
            return ''
        })
        .join('')
}

export const getFacebookId = () => {
    const node = isMobileFacebook ? searchUserIdSelectorOnMobile().evaluate() : searchUserIdSelector().evaluate()

    if (!node) return ''
    const url = new URL(node.href)

    if (url.pathname === '/profile.php') return url.searchParams.get(isMobileFacebook ? 'lst' : 'id')

    return url.pathname.replaceAll('/', '')
}

const FACEBOOK_AVATAR_ID_MATCH = /(\w+).(?:png|jpg|gif|bmp)/

export const getAvatarId = (avatarURL: string) => {
    if (!avatarURL) return ''
    const _url = new URL(avatarURL)
    const match = _url.pathname.match(FACEBOOK_AVATAR_ID_MATCH)
    if (!match) return ''
    return match[1]
}
