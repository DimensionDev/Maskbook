import { OnlyRunInContext } from '@holoflows/kit/es'

OnlyRunInContext('content', 'isMobile')
export const isMobileFacebook = location.hostname === 'm.facebook.com'
