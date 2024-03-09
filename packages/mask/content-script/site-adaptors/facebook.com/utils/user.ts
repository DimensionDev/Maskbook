import { ValueRef } from '@masknet/shared-base'
import {
    searchAvatarSelector,
    searchBioSelector,
    searchHomepageSelector,
    searchIntroSectionSelector,
    searchNickNameSelector,
    searchUserIdSelector,
} from './selector.js'
import { collectNodeText } from '../../../utils/index.js'

export function getNickName(userId?: string | null) {
    const node = searchNickNameSelector(userId).evaluate()
    if (!node) return ''

    return collectNodeText(node)
}

export function getAvatar() {
    const node = searchAvatarSelector().evaluate()
    if (!node) return

    const imageURL = node.getAttribute('xlink:href') ?? ''
    return imageURL.trim()
}

const bioDescription = new ValueRef('')
export function getBioDescription() {
    const intro = searchIntroSectionSelector().evaluate()
    const node = searchBioSelector().evaluate()

    if (intro && node) {
        bioDescription.value = collectNodeText(node)
    } else if (intro) {
        bioDescription.value = ''
    }

    return bioDescription.value
}

export function getFacebookId() {
    const node = searchUserIdSelector().evaluate()
    if (!node?.href) return ''

    if (!URL.canParse(node.href, location.href)) return ''
    const url = new URL(node.href, location.href)
    if (url.pathname === '/profile.php') return url.searchParams.get('id')
    return url.pathname.replaceAll('/', '')
}

const FACEBOOK_AVATAR_ID_MATCH = /(\w+).(?:png|jpg|gif|bmp)/

export function getAvatarId(avatarURL: string) {
    if (!avatarURL) return ''
    const _url = new URL(avatarURL)
    const match = _url.pathname.match(FACEBOOK_AVATAR_ID_MATCH)
    if (!match) return ''
    return match[1]
}

const homepageCache = new ValueRef('')
export function getPersonalHomepage() {
    const intro = searchIntroSectionSelector().evaluate()
    const node = searchHomepageSelector().evaluate()
    if (intro && node) {
        let text = collectNodeText(node)
        if (text && !text.startsWith('http')) {
            text = 'http://' + text
        }
        homepageCache.value = text
    } else if (intro) {
        homepageCache.value = ''
    }

    return homepageCache.value
}
