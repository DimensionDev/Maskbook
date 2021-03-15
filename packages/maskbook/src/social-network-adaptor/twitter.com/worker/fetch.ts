import type { ProfileIdentifier, PostIdentifier } from '../../../database/type'
import { getPostUrlAtTwitter, getProfileUrlAtTwitter } from '../utils/url'
import tasks from '../../../extension/content-script/tasks'
import { isMobileTwitter } from '../utils/isMobile'
import type { SocialNetworkUI } from '../../../social-network'

/**
 *  get things at server side with legacy twitter
 *  seems not possible since we cannot access the
 *  legacy twitter with only a fetch.
 *  resolve this problem when you can.
 */

export function fetchPostContent(post: PostIdentifier<ProfileIdentifier>): Promise<string> {
    return tasks(getPostUrlAtTwitter(post)).getPostContent()
}

export function fetchProfile(self: ProfileIdentifier): Promise<SocialNetworkUI.CollectingCapabilities.ProfileUI> {
    return tasks(getProfileUrlAtTwitter(self, isMobileTwitter as boolean), {}).getProfile()
}
