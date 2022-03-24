import { collectNodeText } from '../../../utils'
import {
    bioDescriptionSelector,
    personalHomepageSelector,
    searchInstagramAvatarSelector,
    searchNickNameSelector,
    searchUserIdInEditPageSelector,
    searchUserIdSelector,
} from './selector'

export function getBioDescription() {
    const bio = bioDescriptionSelector().evaluate()
    return bio ? collectNodeText(bio) : ''
}

export const getPersonalHomepage = () => {
    const node = personalHomepageSelector().evaluate()
    if (!node?.textContent) return ''
    if (node.textContent.startsWith('http')) return node.textContent
    return `https://${node.textContent}`
}

export const getNickname = () => {
    const node = searchNickNameSelector().evaluate()
    return node ? collectNodeText(node) : ''
}

export const getUserId = () => {
    const node = searchUserIdSelector().evaluate()
    const secondNode = searchUserIdInEditPageSelector().evaluate()
    return node ? collectNodeText(node) : secondNode ? collectNodeText(secondNode) : ''
}

export const getAvatar = () => {
    const node = searchInstagramAvatarSelector().evaluate()
    if (!node) return ''

    const imageURL = node.getAttribute('src') ?? ''
    return imageURL.trim()
}

const INSTAGRAM_AVATAR_ID_MATCH = /(\w+).(?:png|jpg|gif|bmp)/

export const getAvatarId = (avatarURL: string) => {
    if (!avatarURL) return ''
    const _url = new URL(avatarURL)
    const match = _url.pathname.match(INSTAGRAM_AVATAR_ID_MATCH)
    if (!match) return ''
    return match[1]
}
