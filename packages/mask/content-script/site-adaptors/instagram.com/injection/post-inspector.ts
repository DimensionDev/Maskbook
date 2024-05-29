import { injectPostInspectorDefault } from '../../../site-adaptor-infra/defaults/index.js'
import type { PostInfo } from '@masknet/plugin-infra/content-script'
import { getOrAttachShadowRoot } from '@masknet/shared-base-ui'

export function injectPostInspectorInstagram(signal: AbortSignal, current: PostInfo) {
    return injectPostInspectorDefault(
        {
            injectionPoint: (post) => getOrAttachShadowRoot(post.suggestedInjectionPoint),
        },
        { slotPosition: 'after' },
    )(current, signal)
}
