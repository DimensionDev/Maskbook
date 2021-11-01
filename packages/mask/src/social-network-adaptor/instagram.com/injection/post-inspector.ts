import { injectPostInspectorDefault } from '../../../social-network/defaults'
import type { PostInfo } from '../../../social-network/PostInfo'
import { Flags } from '../../../utils/flags'

const map = new WeakMap<HTMLElement, ShadowRoot>()
function getShadowRoot(node: HTMLElement) {
    if (map.has(node)) return map.get(node)!
    const dom = node.attachShadow({ mode: Flags.using_ShadowDOM_attach_mode })
    map.set(node, dom)
    return dom
}
export function injectPostInspectorInstagram(signal: AbortSignal, current: PostInfo) {
    return injectPostInspectorDefault(
        {
            injectionPoint: (post) => getShadowRoot(post.postContentNode),
        },
        () => ({ slotPosition: 'after' }),
    )(current, signal)
}
