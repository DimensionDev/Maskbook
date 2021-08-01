import { isNull } from 'lodash-es'
import type { SocialNetwork } from '../../../social-network'
import { bioPageUserNickNameSelector, bioPageUserIDSelector, bioDescriptionSelector } from './selector'

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
    const nicknameNode = bioPageUserNickNameSelector().evaluate()
    if (!nicknameNode) return ''
    return nicknameNode.innerText.trim()
}

export const getTwitterId = () => {
    const twitterIdNode = bioPageUserIDSelector(bioPageUserNickNameSelector).evaluate()
    if (!twitterIdNode) return ''
    return twitterIdNode
}

export const getBioDescription = () => {
    const node = bioDescriptionSelector().evaluate()
    return node?.innerText ?? ''
}
