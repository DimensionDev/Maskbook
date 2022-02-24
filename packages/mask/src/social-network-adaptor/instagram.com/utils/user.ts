import { collectNodeText } from '../../../utils'
import {
    bioDescriptionSelector,
    personalHomepageSelector,
    searchAvatarSelector,
    searchNickNameSelector,
    searchUserIdSelector,
} from './selector'

export function getBioDescription() {
    const bio = bioDescriptionSelector().evaluate()
    return bio ? collectNodeText(bio) : ''
}

export const getPersonalHomepage = () => {
    const node = personalHomepageSelector().evaluate()
    return node?.textContent || ''
}

export const getNickname = () => {
    const node = searchNickNameSelector().evaluate()
    return node ? collectNodeText(node) : ''
}

export const getUserId = () => {
    const node = searchUserIdSelector().evaluate()
    return node ? collectNodeText(node) : ''
}

export const getAvatar = () => {
    const node = searchAvatarSelector().evaluate()
    if (!node) return ''

    const imageURL = node.getAttribute('src') ?? ''
    return imageURL.trim()
}
