import { injectPostReplacer } from '../../../social-network/defaults/inject/PostReplacer'
import type { PostInfo } from '../../../social-network/PostInfo'

function resolveContentNode(node: HTMLElement) {
    return node.closest(
        [
            'm-activity__content .m-activityContent__messageWrapper > span:first-child',
            'm-activity__content .m-activityContent__mediaDescriptionText',
        ].join() as any,
    )
}

export function injectPostReplacerAtMinds(signal: AbortSignal, current: PostInfo) {
    return injectPostReplacer({
        zipPost(node) {
            const langNode = resolveContentNode(node.current)
            if (langNode) langNode.style.display = 'none'
        },
        unzipPost(node) {
            if (!node.current) return
            const langNode = resolveContentNode(node.current)
            if (langNode) langNode.style.display = 'unset'
        },
    })(current, signal)
}
