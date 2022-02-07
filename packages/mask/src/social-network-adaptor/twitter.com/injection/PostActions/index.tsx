import type { PostInfo } from '@masknet/plugin-infra'
import { createPostActionsInjecter } from '../../../../social-network/defaults/inject/PostActions'

export function injectPostActionsAtTwitter(signal: AbortSignal, current: PostInfo) {
    const injecter = createPostActionsInjecter()
    return injecter(current, signal)
}
