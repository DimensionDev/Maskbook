import { injectPostInspectorDefault } from '../../../social-network/defaults/inject/PostInspector'
import type { PostInfo } from '../../../social-network/PostInfo'

export function injectPostInspectorAtMinds(signal: AbortSignal, current: PostInfo) {
    return injectPostInspectorDefault()(current, signal)
}
