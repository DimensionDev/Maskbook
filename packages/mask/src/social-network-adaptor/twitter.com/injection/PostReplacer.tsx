import type { PostInfo } from '../../../social-network/PostInfo'
import { injectPostReplacer } from '../../../social-network/defaults/inject/PostReplacer'

function resolveLangNode(node: HTMLElement) {
    return node.hasAttribute('lang')
        ? node
        : node.querySelector<HTMLDivElement>('[lang]') ?? node.parentElement?.querySelector<HTMLDivElement>('[lang]')
}

export function injectPostReplacerAtTwitter(signal: AbortSignal, current: PostInfo) {
    return injectPostReplacer({
        zipPost(node) {
            const langNode = resolveLangNode(node.current)
            if (langNode) langNode.style.display = 'none'
        },
        unzipPost(node) {
            if (!node.current) return
            const langNode = resolveLangNode(node.current)
            if (langNode) langNode.style.display = 'unset'
        },
    })(current, signal)
}
