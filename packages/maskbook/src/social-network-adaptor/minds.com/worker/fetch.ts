import type { PostIdentifier, ProfileIdentifier } from '../../../database/type'
import tasks from '../../../extension/content-script/tasks'
import type { SocialNetworkUI } from '../../../social-network'
import { getPostUrlAtMinds, getProfileUrlAtMinds } from '../utils/url'

export function fetchPostContent(post: PostIdentifier<ProfileIdentifier>): Promise<string> {
    return tasks(getPostUrlAtMinds(post)).getPostContent()
}

export function fetchProfile(self: ProfileIdentifier): Promise<SocialNetworkUI.CollectingCapabilities.ProfileUI> {
    return tasks(getProfileUrlAtMinds(self, false), {}).getProfile()
}
