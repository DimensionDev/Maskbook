import type { PostInfo } from '@masknet/plugin-infra'
import { createPostActionsInjector } from '../../../../social-network/defaults/inject/PostActions'

export function injectPostActionsAtTwitter(signal: AbortSignal, current: PostInfo) {
    const injector = createPostActionsInjector()
    return injector(current, signal)
}
