import { ProfileIdentifier, PostIdentifier } from '../../../database/type'
import { usernameValidator } from './user'
import { geti18nString } from '../../../utils/i18n'

export const twitterUrl = {
    hostIdentifier: 'twitter.com',
    hostLeadingUrl: 'https://twitter.com',
    hostLeadingUrlMobile: 'https://mobile.twitter.com',
}

export const hostLeadingUrlAutoTwitter = (isMobile: boolean) =>
    isMobile ? twitterUrl.hostLeadingUrlMobile : twitterUrl.hostLeadingUrl

export const getPostUrl = (post: PostIdentifier<ProfileIdentifier>, isMobile: boolean = false) => {
    if (!usernameValidator(post.identifier.userId)) {
        throw new Error(geti18nString('service_username_invalid'))
    }
    return `${hostLeadingUrlAutoTwitter(isMobile)}/${post.identifier.userId}/status/${post.postId}`
}

export const getProfileUrl = (self: ProfileIdentifier, isMobile: boolean = false) => {
    return isMobile
        ? `${hostLeadingUrlAutoTwitter(isMobile)}/account`
        : `${hostLeadingUrlAutoTwitter(isMobile)}/${self.userId}`
}

export const topSites = [
    'www.google.com',
    'www.youtube.com',
    'www.tmall.com',
    'www.baidu.com',
    'www.qq.com',
    'www.facebook.com',
    'www.sohu.com',
    'www.taobao.com',
    'www.wikipedia.org',
    'dropbox.com',
    'www.yahoo.com',
    'www.jd.com',
    'www.amazon.com',
    'sina.com.cn',
    'www.weibo.com',
    'pages.tmall.com',
    'www.reddit.com',
    'www.live.com',
    'www.vk.com',
    'www.netflix.com',
    'www.okezone.com',
    'www.blogspot.com',
    'www.alipay.com',
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
