import { OnlyRunInContext } from '@holoflows/kit/es'
import { twitterUrl } from './url'

export const isMobileTwitter = OnlyRunInContext('content', false)
    ? location.hostname === twitterUrl.hostLeadingUrlMobile.substr(8)
    : navigator.userAgent.match(/Mobile|mobile/)
