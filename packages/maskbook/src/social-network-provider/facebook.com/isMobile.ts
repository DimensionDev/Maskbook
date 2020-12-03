import { Environment, isEnvironment } from '@dimensiondev/holoflows-kit'

export const isMobileFacebook = isEnvironment(Environment.ContentScript)
    ? location.hostname === 'm.facebook.com'
    : navigator.userAgent.match(/Mobile|mobile/)
export const facebookDomain = isMobileFacebook ? 'https://m.facebook.com/' : 'https://facebook.com/'
