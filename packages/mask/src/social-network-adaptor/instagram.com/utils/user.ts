import { collectNodeText } from '../../../utils'
import {
    bioDescriptionSelector,
    personalHomepageSelector,
    searchInstagramAvatarSelector,
    searchNickNameSelector,
    searchUserIdSelector,
} from './selector'
import { InMemoryStorages } from '../../../../shared'

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
    const node = searchInstagramAvatarSelector().evaluate()
    if (!node) return ''

    const imageURL = node.getAttribute('src') ?? ''
    return imageURL.trim()
}

export const clearStorages = () => {
    InMemoryStorages.InstagramNFTEvent.storage.userId.setValue('')
    InMemoryStorages.InstagramNFTEvent.storage.address.setValue('')
    InMemoryStorages.InstagramNFTEvent.storage.tokenId.setValue('')
}

const INSTAGRAM_AVATAR_ID_MATCH = /(\w+).(?:png|jpg|gif|bmp)/

export const getAvatarId = (avatarURL: string) => {
    if (!avatarURL) return ''
    const _url = new URL(avatarURL)
    const match = _url.pathname.match(INSTAGRAM_AVATAR_ID_MATCH)
    if (!match) return ''
    return match[1]
}
