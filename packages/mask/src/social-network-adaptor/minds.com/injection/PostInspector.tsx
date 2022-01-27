import { injectPostInspectorDefault } from '../../../social-network/defaults/inject/PostInspector'
import type { PostInfo } from '../../../social-network/PostInfo'

function resolveContentNode(node: HTMLElement) {
    return node.closest(
        [
            'm-activity__content .m-activityContent__messageWrapper > span:first-child',
            'm-activity__content .m-activityContent__mediaDescriptionText',
        ].join() as any,
    )
}

export function injectPostInspectorAtMinds(signal: AbortSignal, current: PostInfo) {
    return injectPostInspectorDefault({
        zip(node) {
            const langNode = resolveContentNode(node.current)
            if (langNode) langNode.style.display = 'none'
        },
        unzip(node) {
            if (!node.current) return
            const langNode = resolveContentNode(node.current)
            if (langNode) langNode.style.display = 'unset'
        },
    })(current, signal)
}
