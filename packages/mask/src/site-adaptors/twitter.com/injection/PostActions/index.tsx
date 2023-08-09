import type { PostInfo } from '@masknet/plugin-infra/content-script'
import { Flags } from '@masknet/flags'
import { createPostActionsInjector } from '../../../../site-adaptor-infra/defaults/inject/PostActions.js'

export function injectPostActionsAtTwitter(signal: AbortSignal, postInfo: PostInfo) {
    if (!Flags.post_actions_enabled) return
    const injector = createPostActionsInjector()
    return injector(postInfo, signal)
}
