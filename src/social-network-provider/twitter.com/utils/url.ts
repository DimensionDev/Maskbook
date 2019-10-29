import { PersonIdentifier, PostIdentifier } from '../../../database/type'
import { usernameValidator } from './user'
import { geti18nString } from '../../../utils/i18n'

export const hostIdentifier = 'twitter.com'
export const hostLeadingUrl = 'https://twitter.com'
export const hostLeadingUrlMobile = 'https://mobile.twitter.com'
export const anyHostUrl = `${hostLeadingUrl}/*`
export const anyHostUrlMobile = `${hostLeadingUrlMobile}/*`

const hostLeadingUrlAuto = (isMobile: boolean) => isMobile ? hostLeadingUrlMobile : hostLeadingUrl

export const getPostUrl = (post: PostIdentifier<PersonIdentifier>, useMobile: boolean = false) => {
    if (!usernameValidator(post.identifier.userId)) {
        throw new Error(geti18nString('service_username_invalid'))
    }
    return `${hostLeadingUrlAuto(useMobile)}/${post.identifier.userId}/status/${post.postId}`
}

export const getProfileUrl = (self: PersonIdentifier, useMobile: boolean = false) => {
    return `${hostLeadingUrlAuto(useMobile)}/${self.userId}`
}
