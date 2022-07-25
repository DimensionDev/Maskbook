import { EnhanceableSite } from '@masknet/shared-base'
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
} from './selector'
import { collectNodeText } from '../../../utils'
import { isMobileFacebook } from './isMobile'
import { bioDescription, personalHomepage } from '../../../../shared/legacy-settings/settings'

export const getNickName = () => {
    const node = isMobileFacebook ? searchNickNameSelectorOnMobile().evaluate() : searchNickNameSelector().evaluate()
    if (!node) return ''

    return collectNodeText(node)
}

export const getAvatar = () => {
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

export const getBioDescription = () => {
    const intro = searchIntroSectionSelector().evaluate()
    const node = isMobileFacebook ? bioDescriptionSelectorOnMobile().evaluate() : searchBioSelector().evaluate()

    if (intro && node) {
        const text = collectNodeText(node)
        bioDescription[EnhanceableSite.Facebook].value = text
    } else if (intro) {
        bioDescription[EnhanceableSite.Facebook].value = ''
    }

    return bioDescription[EnhanceableSite.Facebook].value
}

export const getFacebookId = () => {
    const node = isMobileFacebook ? searchUserIdSelectorOnMobile().evaluate() : searchUserIdSelector().evaluate()

    if (!node) return ''
    const url = new URL(node.href)

    if (url.pathname === '/profile.php') return url.searchParams.get(isMobileFacebook ? 'lst' : 'id')

    return url.pathname.replaceAll('/', '')
}

const FACEBOOK_AVATAR_ID_MATCH = /(\w+).(?:png|jpg|gif|bmp)/

export const getAvatarId = (avatarURL: string) => {
    if (!avatarURL) return ''
    const _url = new URL(avatarURL)
    const match = _url.pathname.match(FACEBOOK_AVATAR_ID_MATCH)
    if (!match) return ''
    return match[1]
}

export const getPersonalHomepage = () => {
    const intro = searchIntroSectionSelector().evaluate()
    const node = searchHomepageSelector().evaluate()
    if (intro && node) {
        let text = collectNodeText(node)
        if (text && !text.startsWith('http')) {
            text = 'http://' + text
        }
        personalHomepage[EnhanceableSite.Facebook].value = text
    } else if (intro) {
        personalHomepage[EnhanceableSite.Facebook].value = ''
    }

    return personalHomepage[EnhanceableSite.Facebook].value
}
