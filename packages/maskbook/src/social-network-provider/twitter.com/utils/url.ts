import type { ProfileIdentifier, PostIdentifier } from '../../../database/type'
import { usernameValidator } from './user'
import { i18n } from '../../../utils/i18n-next'

export const twitterUrl = {
    hostIdentifier: 'twitter.com',
    hostLeadingUrl: 'https://twitter.com',
    hostLeadingUrlMobile: 'https://mobile.twitter.com',
}

export const hostLeadingUrlAutoTwitter = (isMobile: boolean) =>
    isMobile ? twitterUrl.hostLeadingUrlMobile : twitterUrl.hostLeadingUrl

export const getPostUrlAtTwitter = (post: PostIdentifier<ProfileIdentifier>, isMobile: boolean = false) => {
    if (!usernameValidator(post.identifier.userId)) {
        console.error(new Error(i18n.t('service_username_invalid')))
    }
    return `${hostLeadingUrlAutoTwitter(isMobile)}/${post.identifier.userId}/status/${post.postId}`
}

export const getProfileUrlAtTwitter = (self: ProfileIdentifier, isMobile: boolean = false) => {
    return isMobile
        ? `${hostLeadingUrlAutoTwitter(isMobile)}/account`
        : `${hostLeadingUrlAutoTwitter(isMobile)}/${self.userId}`
}

// more about twitter photo url formating: https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/entities-object#photo_format
export const canonifyImgUrl = (url: string) => {
    const parsed = new URL(url)
    if (parsed.hostname !== 'pbs.twimg.com') {
        return url
    }
    const { searchParams } = parsed
    searchParams.set('name', 'orig')
    // we can't understand original image format when given url labeled as webp
    if (searchParams.get('format') === 'webp') {
        searchParams.set('format', 'png')
        const pngURL = parsed.href
        searchParams.set('format', 'jpg')
        const jpgURL = parsed.href
        return [pngURL, jpgURL]
    }
    return parsed.href
}
