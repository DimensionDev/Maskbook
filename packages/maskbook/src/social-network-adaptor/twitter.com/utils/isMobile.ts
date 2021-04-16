import { Environment, isEnvironment } from '@dimensiondev/holoflows-kit'
import { twitterUrl } from './url'

export const isMobileTwitter = isEnvironment(Environment.ContentScript)
    ? location.hostname === twitterUrl.hostLeadingUrlMobile.substr(8)
    : !!navigator.userAgent.match(/Mobile|mobile/)
export const twitterDomain = isMobileTwitter ? 'https://mobile.twitter.com/' : 'https://twitter.com/'
