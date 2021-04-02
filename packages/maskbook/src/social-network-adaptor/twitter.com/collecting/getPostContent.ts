import { timeout } from '../../../utils/utils'
import { postsSelector } from '../utils/selector'
import type { SocialNetworkUI } from '../../../social-network'
import { postContentParser } from '../utils/fetch'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'

export const getPostContentTwitter: SocialNetworkUI.CollectingCapabilities.Define['getPostContent'] = async () => {
    const contentNode = (await timeout(new MutationObserverWatcher(postsSelector()), 10000))[0]
    return contentNode ? postContentParser(contentNode) : ''
}
