import { injectPostInspectorDefault } from '../../../social-network/defaults'
import type { PostInfo } from '@masknet/plugin-infra/content-script'

const map = new WeakMap<HTMLElement, ShadowRoot>()
function getShadowRoot(node: HTMLElement) {
    if (map.has(node)) return map.get(node)!
    const dom = node.attachShadow({ mode: 'closed' })
    map.set(node, dom)
    return dom
}
export function injectPostInspectorInstagram(signal: AbortSignal, current: PostInfo) {
    return injectPostInspectorDefault(
        {
            injectionPoint: (post) => getShadowRoot(post.suggestedInjectionPoint),
        },
        () => ({ slotPosition: 'after' }),
    )(current, signal)
}
