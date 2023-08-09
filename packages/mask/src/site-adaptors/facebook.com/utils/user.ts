import { ValueRef } from '@masknet/shared-base'
import {
    bioDescriptionSelectorOnMobile,
    searchAvatarSelector,
    searchBioSelector,
    searchFacebookAvatarOnMobileSelector,
    searchHomepageSelector,
    searchIntroSectionSelector,
    searchNickNameSelector,
    searchNickNameSelectorOnMobile,
    searchUserIdSelector,
    searchUserIdSelectorOnMobile,
} from './selector.js'
import { collectNodeText } from '../../../utils/index.js'
import { isMobileFacebook } from './isMobile.js'

export function getNickName() {
    const node = isMobileFacebook ? searchNickNameSelectorOnMobile().evaluate() : searchNickNameSelector().evaluate()
    if (!node) return ''

    return collectNodeText(node)
}

export function getAvatar() {
    const node = isMobileFacebook
        ? searchFacebookAvatarOnMobileSelector().evaluate()
        : searchAvatarSelector().evaluate()
    if (!node) return

    const imageURL =
        (isMobileFacebook
            ? node.style.background.match(/\(["']?(.*?)["']?\)/)?.[1]
            : node.getAttribute('xlink:href')) ?? ''

    return imageURL.trim()
}

const bioDescription = new ValueRef('')
export function getBioDescription() {
    const intro = searchIntroSectionSelector().evaluate()
    const node = isMobileFacebook ? bioDescriptionSelectorOnMobile().evaluate() : searchBioSelector().evaluate()

    if (intro && node) {
        const text = collectNodeText(node)
        bioDescription.value = text
    } else if (intro) {
        bioDescription.value = ''
    }

    return bioDescription.value
}

export function getFacebookId() {
    const node = isMobileFacebook ? searchUserIdSelectorOnMobile().evaluate() : searchUserIdSelector().evaluate()
    if (!node?.href) return ''

    try {
        const url = new URL(node.href, location.href)
        if (url.pathname === '/profile.php') return url.searchParams.get(isMobileFacebook ? 'lst' : 'id')
        return url.pathname.replaceAll('/', '')
    } catch {
        return ''
    }
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
