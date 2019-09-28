import { PersonIdentifier, PostIdentifier } from '../../../database/type'
import { usernameValidator } from './user'
import { geti18nString } from '../../../utils/i18n'
import { hostURL } from '../index'

export const toPostUrl = (post: PostIdentifier<PersonIdentifier>) => {
    if (!usernameValidator(post.identifier.userId)) {
        throw new Error(geti18nString('service_username_invalid'))
    }
    return `${hostURL}/${post.identifier.userId}/status/${post.postId}`
}

export const toProfileUrl = (self: PersonIdentifier) => {
    return `${hostURL}/${self.userId}`
}
