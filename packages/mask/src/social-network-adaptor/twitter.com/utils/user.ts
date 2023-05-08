import { isNull } from 'lodash-es'
import { ProfileIdentifier, type SocialIdentity } from '@masknet/shared-base'
import { Twitter } from '@masknet/web3-providers'
import type { SocialNetwork } from '@masknet/types'
import { collectNodeText } from '../../../utils/index.js'
import { twitterBase } from '../base.js'
import {
    personalHomepageSelector,
    profileBioSelector,
    searchAvatarSelector,
    searchNFTAvatarSelector,
    searchNickNameSelector,
} from './selector.js'

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
    const node = searchNickNameSelector().evaluate()
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

export const getBio = () => {
    const node = profileBioSelector().evaluate()
    return node ? collectNodeText(node) : ''
}

export const getPersonalHomepage = () => {
    const node = personalHomepageSelector().evaluate()
    return node?.getAttribute('href') ?? ''
}

export const getAvatar = () => {
    const node = searchAvatarSelector().evaluate() || searchNFTAvatarSelector().evaluate()
    if (node) {
        const imageURL = node.getAttribute('src') ?? ''
        return imageURL.trim()
    }

    return ''
}

export async function getUserIdentity(twitterId: string): Promise<SocialIdentity | undefined> {
    const user = await Twitter.getUserByScreenName(twitterId)
    if (!user?.legacy) return

    const nickname = user.legacy.name
    const handle = user.legacy.screen_name
    const avatar = user.legacy.profile_image_url_https.replace(/_normal(\.\w+)$/, '_400x400$1')
    const bio = user.legacy.description
    const homepage = user.legacy.entities.url?.urls[0]?.expanded_url ?? ''

    return {
        identifier: ProfileIdentifier.of(twitterBase.networkIdentifier, handle).unwrapOr(undefined),
        nickname,
        avatar,
        bio,
        homepage,
    }
}

export function getUserId(ele: HTMLElement) {
    return ele?.querySelector('a[href][role=link]')?.getAttribute('href')?.slice(1)
}
