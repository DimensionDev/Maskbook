import { OnlyRunInContext } from '@dimensiondev/holoflows-kit/es'

export const isMobileFacebook = OnlyRunInContext('content', false)
    ? location.hostname === 'm.facebook.com'
    : navigator.userAgent.match(/Mobile|mobile/)
export const facebookDomain = isMobileFacebook ? 'https://m.facebook.com/' : 'https://facebook.com/'
