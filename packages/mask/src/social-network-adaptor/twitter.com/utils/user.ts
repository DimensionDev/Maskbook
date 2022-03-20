import { isNull } from 'lodash-unified'
import type { SocialNetwork } from '../../../social-network'
import {
    bioDescriptionSelector,
    searchAvatarSelector,
    searchNickNameSelector,
    personalHomepageSelector,
    searchNFTAvatarSelector,
} from './selector'
import { collectNodeText } from '../../../utils'

/**
 * @link https://help.twitter.com/en/managing-your-account/twitter-username-rules
 */
export const usernameValidator: NonNullable<SocialNetwork.Utils['isValidUsername']> = (name: string) => {
    for (const v of [/(twitter|admin)/i, /.{16,}/, /\W/]) {
        if (!isNull(v.exec(name))) {
            return false
        }
    }
    if (name.length < 4) return false
    return true
}

export const getNickname = () => {
    const node = searchNickNameSelector().evaluate()?.querySelector<HTMLSpanElement>('span span')
    if (!node) return ''

    return collectNodeText(node)
}

export const getTwitterId = () => {
    const ele = searchAvatarSelector().evaluate()?.closest('a') || searchNFTAvatarSelector().evaluate()?.closest('a')
    if (ele) {
        const link = ele.getAttribute('href')
        if (link) {
            const [, userId] = link.match(/^\/(\w+)\/(photo|nft)$/) ?? []
            return userId
        }
    }

    return ''
}

export const getBioDescription = () => {
    const node = bioDescriptionSelector().evaluate()
    return node ? collectNodeText(node) : ''
}

export const getPersonalHomepage = () => {
    const node = personalHomepageSelector().evaluate()
    return node?.getAttribute('href') || ''
}

export const getAvatar = () => {
    const node = searchAvatarSelector().evaluate() || searchNFTAvatarSelector().evaluate()
    if (node) {
        const imageURL = node.getAttribute('src') ?? ''
        return imageURL.trim()
    }

    return ''
}

const TWITTER_AVATAR_ID_MATCH = /^\/profile_images\/(\d+)/
export const getAvatarId = (avatarURL: string) => {
    if (!avatarURL) return ''
    const _url = new URL(avatarURL)
    const match = _url.pathname.match(TWITTER_AVATAR_ID_MATCH)
    if (!match) return ''

    return match[1]
}
