import { PersonIdentifier, PostIdentifier } from '../../../database/type'
import { usernameValidator } from './user'
import { geti18nString } from '../../../utils/i18n'

export const twitterUrl = {
    hostIdentifier: 'twitter.com',
    hostLeadingUrl: 'https://twitter.com',
    hostLeadingUrlMobile: 'https://mobile.twitter.com',
}

const hostLeadingUrlAuto = (isMobile: boolean) =>
    isMobile ? twitterUrl.hostLeadingUrlMobile : twitterUrl.hostLeadingUrl

export const getPostUrl = (post: PostIdentifier<PersonIdentifier>, useMobile: boolean = false) => {
    if (!usernameValidator(post.identifier.userId)) {
        throw new Error(geti18nString('service_username_invalid'))
    }
    return `${hostLeadingUrlAuto(useMobile)}/${post.identifier.userId}/status/${post.postId}`
}

export const getProfileUrl = (self: PersonIdentifier, useMobile: boolean = false) => {
    return useMobile ? `${hostLeadingUrlAuto(useMobile)}/account` : `${hostLeadingUrlAuto(useMobile)}/${self.userId}`
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
    'login.tmall.com',
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
    'www.csdn.net',
    'www.office.com',
    'www.instagram.com',
    'www.yahoo.co.jp',
    'www.bing.com',
    'www.xinhuanet.com',
    'www.microsoft.com',
    'www.aliexpress.com',
    'twitter.com',
    'www.livejasmin.com',
    'google.com.hk',
    'www.stackoverflow.com',
    'www.babytree.com',
    'www.ebay.com',
    'www.naver.com',
    'www.twitch.tv',
    'www.amazon.co.jp',
    'www.pornhub.com',
    'www.tribunnews.com',
    'www.apple.com',
    'www.amazon.in',
    'www.google.co.in',
    'tianya.cn',
    'www.microsoftonline.com',
    'msn.com',
    'www.wordpress.com',
    'www.whitehouse.gov',
]
