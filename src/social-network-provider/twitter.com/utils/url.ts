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
        throw new Error(i18n.t('service_username_invalid'))
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

export const topSites = [
    'www.google.com',
    'www.youtube.com',
    'www.archive.org',
    'aa.com',
    'www.whatsapp.com',
    'www.facebook.com',
    'starbucks.com',
    'line.me',
    'www.wikipedia.org',
    'dropbox.com',
    'www.yahoo.com',
    'www.slack.com',
    'www.amazon.com',
    'play.google.com',
    'www.softbank.com',
    'www.reddit.com',
    'www.vk.com',
    'www.netflix.com',
    'www.blogspot.com',
    'adobe.com',
    'www.office.com',
    'www.instagram.com',
    'www.yahoo.co.jp',
    'www.bing.com',
    'imdb.com',
    'www.microsoft.com',
    'www.aliexpress.com',
    'twitter.com',
    'outlook.com',
    'google.com.hk',
    'www.stackoverflow.com',
    'imgur.com',
    'www.ebay.com',
    'www.naver.com',
    'github.com',
    'www.amazon.co.jp',
    'www.paypal.com',
    'www.tribunnews.com',
    'www.apple.com',
    'www.amazon.in',
    'www.google.co.in',
    'hulu.com',
    'www.microsoftonline.com',
    'msn.com',
    'www.wordpress.com',
    'linkedin.com',
]
