import type { PostIdentifier, ProfileIdentifier } from '../../../database/type'
import { i18n } from '../../../utils/i18n-next'
import { usernameValidator } from './user'

export const mindsUrl = {
    hostIdentifier: 'minds.com',
    hostLeadingUrl: 'https://minds.com',
}

export const getPostUrlAtMinds = (post: PostIdentifier<ProfileIdentifier>, isMobile: boolean = false) => {
    if (!usernameValidator(post.identifier.userId)) throw new Error(i18n.t('service_username_invalid'))
    return `${mindsUrl.hostLeadingUrl}/newsfeed/${post.postId}`
}

export const getProfileUrlAtMinds = (self: ProfileIdentifier, isMobile: boolean = false) => {
    return `${mindsUrl.hostLeadingUrl}/${self.userId}`
}
