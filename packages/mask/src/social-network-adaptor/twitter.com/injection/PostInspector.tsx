import type { PostInfo } from '../../../social-network/PostInfo'
import { injectPostInspectorDefault } from '../../../social-network/defaults/inject/PostInspector'

export function injectPostInspectorAtTwitter(signal: AbortSignal, current: PostInfo) {
    return injectPostInspectorDefault({})(current, signal)
}
