import { PersonIdentifier, PostIdentifier } from '../../../database/type'
import { usernameValidator } from './user'
import { geti18nString } from '../../../utils/i18n'

export const twitterUrl = {
    hostIdentifier: 'twitter.com',
    hostLeadingUrl: 'https://twitter.com',
    hostLeadingUrlMobile: 'https://mobile.twitter.com',
    get anyHostUrl() {
        return `${twitterUrl.hostLeadingUrl}/*`
    },
    get anyHostUrlMobile() {
        return `${twitterUrl.hostLeadingUrlMobile}/*`
    },
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
    return `${hostLeadingUrlAuto(useMobile)}/${self.userId}`
}
