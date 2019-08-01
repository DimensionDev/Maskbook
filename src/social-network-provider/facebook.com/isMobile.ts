import { OnlyRunInContext } from '@holoflows/kit/es'

export const isMobileFacebook = OnlyRunInContext('content', false)
    ? location.hostname === 'm.facebook.com'
    : navigator.userAgent.match(/Mobile|mobile/)
