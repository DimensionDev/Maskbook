import type { PostInfo } from '@masknet/plugin-infra/content-script'
import { injectPostReplacer } from '../../../social-network/defaults/inject/PostReplacer.js'

function resolveLangNode(node: HTMLElement) {
    return node.hasAttribute('lang')
        ? node
        : node.querySelector<HTMLDivElement>('[lang]') ?? node.parentElement?.querySelector<HTMLDivElement>('[lang]')
}

export function injectPostReplacerAtTwitter(signal: AbortSignal, current: PostInfo) {
    const isPromotionPost = !!current.rootNode?.querySelector('svg path[d$="996V8h7v7z"]')
    const isCollapsedPost = !!current.rootNode?.querySelector('[data-testid="tweet-text-show-more-link"]')
    if (isPromotionPost || isCollapsedPost) return

    return injectPostReplacer({
        zipPost(node) {
            if (node.destroyed) return
            const langNode = resolveLangNode(node.current)
            if (langNode) langNode.style.display = 'none'
        },
        unzipPost(node) {
            if (node.destroyed || !node.current) return
            const langNode = resolveLangNode(node.current)
            if (langNode) langNode.style.display = 'unset'
        },
    })(current, signal)
}
