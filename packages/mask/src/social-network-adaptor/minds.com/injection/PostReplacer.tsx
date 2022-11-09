import { injectPostReplacer } from '../../../social-network/defaults/inject/PostReplacer.js'
import type { PostInfo } from '@masknet/plugin-infra/content-script'

function resolveContentNode(node: HTMLElement) {
    return node.closest(
        [
            'm-activityv2__content .m-activityContentText__body > m-readmore span:first-child',
            'm-activityv2__content .m-activityContent__mediaDescriptionText',
        ].join() as any,
    )
}

export function injectPostReplacerAtMinds(signal: AbortSignal, current: PostInfo) {
    return injectPostReplacer({
        zipPost(node) {
            if (node.destroyed) return
            const langNode = resolveContentNode(node.current)
            if (langNode) langNode.style.display = 'none'
        },
        unzipPost(node) {
            if (node.destroyed || !node.current) return
            const langNode = resolveContentNode(node.current)
            if (langNode) langNode.style.display = 'unset'
        },
    })(current, signal)
}
