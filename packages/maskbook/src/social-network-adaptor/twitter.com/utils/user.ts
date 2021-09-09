import { isNull } from 'lodash-es'
import type { SocialNetwork } from '../../../social-network'
import { bioDescriptionSelector, searchAvatarSelector, searchNickNameSelector } from './selector'
import { serializeToText } from './fetch'

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

    const nicknameNode = node.querySelector('div span')
    if (!nicknameNode) return ''

    return serializeToText(nicknameNode)
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
    return node ? serializeToText(node) : ''
}

export const getAvatar = () => {
    const node = searchAvatarSelector().evaluate() as HTMLImageElement
    if (!node) return ''

    const imageURL = node.getAttribute('src') ?? ''
    return imageURL.trim()
}
