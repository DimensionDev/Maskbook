import { OnlyRunInContext } from '@dimensiondev/holoflows-kit/es'
import { twitterUrl } from './url'

export const isMobileTwitter = OnlyRunInContext('content', false)
    ? location.hostname === twitterUrl.hostLeadingUrlMobile.substr(8)
    : !!navigator.userAgent.match(/Mobile|mobile/)
export const twitterDomain = isMobileTwitter ? 'https://m.twitter.com/' : 'https://twitter.com/'
