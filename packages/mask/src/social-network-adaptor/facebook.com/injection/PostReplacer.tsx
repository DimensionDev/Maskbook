import { injectPostReplacer } from '../../../social-network/defaults/inject/PostReplacer'
import type { PostInfo } from '@masknet/plugin-infra/content-script'

function resolveContentNode(node: HTMLElement) {
    return node.querySelector<HTMLDivElement>('[role=article] div[dir="auto"] > [id] > div > div > span')
}

export function injectPostReplacerAtFacebook(signal: AbortSignal, current: PostInfo) {
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
