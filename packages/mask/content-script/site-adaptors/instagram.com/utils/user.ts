import { compact } from 'lodash-es'
import { collectNodeText } from '../../../utils/index.js'
import {
    bioDescriptionSelector,
    searchInstagramHandleSelector,
    searchNickNameSelector,
    searchInstagramSelfAvatarSelector,
} from './selector.js'

export function getBioDescription() {
    const bio = bioDescriptionSelector().evaluate()
    return bio ? collectNodeText(bio) : ''
}

export function getPersonalHomepage() {
    const node = searchInstagramHandleSelector().evaluate()

    if (!node) return
    return node.href
}

export function getNickname() {
    const node = searchNickNameSelector().evaluate()
    return node ? collectNodeText(node) : ''
}

export function getUserId() {
    const node = searchInstagramHandleSelector().evaluate()
    if (!node) return
    return compact(node.getAttribute('href')?.split('/')).pop()
}

export function getAvatar() {
    const node = searchInstagramSelfAvatarSelector().evaluate()

    if (!node) return ''
    const imageURL = node.getAttribute('src') ?? ''
    return imageURL.trim()
}

const INSTAGRAM_AVATAR_ID_MATCH = /(\w+).(?:png|jpg|gif|bmp)/

export function getAvatarId(avatarURL: string) {
    if (!avatarURL) return ''
    const _url = new URL(avatarURL)
    const match = _url.pathname.match(INSTAGRAM_AVATAR_ID_MATCH)
    if (!match) return ''
    return match[1]
}
