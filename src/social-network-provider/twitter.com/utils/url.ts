import { PersonIdentifier, PostIdentifier } from '../../../database/type'
import { usernameValidator } from './user'
import { geti18nString } from '../../../utils/i18n'

const host = window.location.hostname
export const toPostUrl = (post: PostIdentifier<PersonIdentifier>) => {
    if (!usernameValidator(post.identifier.userId)) {
        throw new TypeError(geti18nString('service_username_invalid'))
    }
    return `https://${host}/${post.identifier.userId}/status/${post.postId}`
}

export const toProfileUrl = (self: PersonIdentifier) => {
    return `https://${host}/${self.userId}`
}
