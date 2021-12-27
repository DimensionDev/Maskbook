import { isNull } from 'lodash-unified'
import type { SocialNetwork } from '../../../social-network'
import {
    bioDescriptionSelector,
    searchAvatarSelector,
    searchNickNameSelector,
    personalHomepageSelector,
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
    const node = searchNickNameSelector().evaluate()?.parentElement?.parentElement?.firstChild
        ?.nextSibling as HTMLDivElement
    if (!node) return ''

    const nicknameNode = node.querySelector<HTMLSpanElement>('div span')
    if (!nicknameNode) return ''

    return collectNodeText(nicknameNode)
}

export const getTwitterId = () => {
    const node = searchNickNameSelector().evaluate()?.parentElement?.parentElement?.firstChild?.nextSibling?.firstChild
        ?.firstChild?.lastChild as HTMLDivElement
    if (!node) return ''

    const twitterIdNode = node.querySelector('div span')
    if (!twitterIdNode) return ''
    return twitterIdNode.innerHTML.trim().replace('@', '')
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
    const node = searchAvatarSelector().evaluate() as HTMLImageElement
    if (!node) return ''

    const imageURL = node.getAttribute('src') ?? ''
    return imageURL.trim()
}

const TWITTER_AVATAR_ID_MATCH = /^\/profile_images\/(\d+)/

export const getAvatarId = (avatarURL: string) => {
    if (!avatarURL) return ''
    const _url = new URL(avatarURL)
    const match = _url.pathname.match(TWITTER_AVATAR_ID_MATCH)
    if (!match) return ''

    return match[1]
}
