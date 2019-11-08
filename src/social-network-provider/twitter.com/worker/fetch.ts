import { PersonIdentifier, PostIdentifier } from '../../../database/type'
import { getPostUrl, getProfileUrl } from '../utils/url'
import tasks from '../../../extension/content-script/tasks'

/**
 *  get things at server side with legacy twitter
 *  seems not possible since we cannot access the
 *  legacy twitter with only a fetch.
 *  resolve this problem when you can.
 */

export const fetchPostContent = async (post: PostIdentifier<PersonIdentifier>) => {
    return tasks(getPostUrl(post)).getPostContent()
}

export const fetchProfile = async (self: PersonIdentifier) => {
    return tasks(getProfileUrl(self), {}).getProfile(self)
}
