import { injectPostInspectorDefault } from '../../../social-network/defaults'
import type { PostInfo } from '../../../social-network/PostInfo'
import { Flags } from '../../../utils/flags'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'

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
            zipPost(node) {},
            render(jsx, postInfo) {
                const root = createReactRootShadowed(getShadowRoot(postInfo.postContentNode!), { signal })
                root.render(jsx)
                return root.destory
            },
        },
        () => ({ slotPosition: 'after' }),
    )(current, signal)
}
