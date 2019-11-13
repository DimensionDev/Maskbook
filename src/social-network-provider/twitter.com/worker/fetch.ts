import { ProfileIdentifier, PostIdentifier } from '../../../database/type'
import { getPostUrl, getProfileUrl } from '../utils/url'
import tasks from '../../../extension/content-script/tasks'
import { isMobileTwitter } from '../utils/isMobile'

/**
 *  get things at server side with legacy twitter
 *  seems not possible since we cannot access the
 *  legacy twitter with only a fetch.
 *  resolve this problem when you can.
 */

export const fetchPostContent = (post: PostIdentifier<ProfileIdentifier>) => {
    return tasks(getPostUrl(post)).getPostContent()
}

export const fetchProfile = (self: ProfileIdentifier) => {
    return tasks(getProfileUrl(self, isMobileTwitter as boolean), {}).getProfile(self)
}
