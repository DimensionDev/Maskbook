import type { PostInfo } from '../../../social-network/PostInfo'
import { injectPostInspectorDefault } from '../../../social-network/defaults/inject/PostInspector'

function resolveLangNode(node: HTMLElement) {
    return node.hasAttribute('lang')
        ? node
        : node.querySelector<HTMLDivElement>('[lang]') ?? node.parentElement?.querySelector<HTMLDivElement>('[lang]')
}

export function injectPostInspectorAtTwitter(signal: AbortSignal, current: PostInfo) {
    return injectPostInspectorDefault({
        zip(node) {
            const langNode = resolveLangNode(node.current)
            if (langNode) langNode.style.display = 'none'
        },
        unzip(node) {
            if (!node.current) return
            const langNode = resolveLangNode(node.current)
            if (langNode) langNode.style.display = 'unset'
        },
    })(current, signal)
}
