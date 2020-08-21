import type { PostInfo } from '../../../social-network/PostInfo'
import { injectPostDummyDefault } from '../../../social-network/defaults/injectPostDummy'

export function injectPostDummyAtTwitter(current: PostInfo) {
    return injectPostDummyDefault()(current)
}
