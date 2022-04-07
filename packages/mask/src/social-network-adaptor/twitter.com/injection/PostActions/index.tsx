import type { PostInfo } from '@masknet/plugin-infra'
import { Flags } from '../../../../../shared'
import { createPostActionsInjector } from '../../../../social-network/defaults/inject/PostActions'

export function injectPostActionsAtTwitter(signal: AbortSignal, postInfo: PostInfo) {
    if (!Flags.post_actions_enabled) return
    const injector = createPostActionsInjector()
    return injector(postInfo, signal)
}
