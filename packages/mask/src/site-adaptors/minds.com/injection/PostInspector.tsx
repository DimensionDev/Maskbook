import { injectPostInspectorDefault } from '../../../site-adaptor-infra/defaults/inject/PostInspector.js'
import type { PostInfo } from '@masknet/plugin-infra/content-script'

export function injectPostInspectorAtMinds(signal: AbortSignal, current: PostInfo) {
    return injectPostInspectorDefault()(current, signal)
}
