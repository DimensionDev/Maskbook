import type { PostInfo } from '@masknet/plugin-infra/content-script'
import { injectPostReplacer } from '../../../site-adaptor-infra/defaults/inject/PostReplacer.js'

function resolveLangNode(node: HTMLElement) {
    return node.hasAttribute('lang') ? node : (
            node.querySelector<HTMLDivElement>('[lang]') ?? node.parentElement?.querySelector<HTMLDivElement>('[lang]')
        )
}

export function injectPostReplacerAtTwitter(signal: AbortSignal, current: PostInfo) {
    const isPromotionPost = !!current.rootNode?.querySelector('svg path[d$="996V8h7v7z"]')
    const isCollapsedPost = !!current.rootNode?.querySelector('[data-testid="tweet-text-show-more-link"]')
    if (isPromotionPost || isCollapsedPost) return

    const hasVideo = !!current.rootNode?.closest('[data-testid="tweet"]')?.querySelector('video')
    if (hasVideo) return

    const tags = Array.from(
        current.rootNode?.querySelectorAll<HTMLAnchorElement>(
            ['a[role="link"][href*="cashtag_click"]', 'a[role="link"][href*="hashtag_click"]'].join(','),
        ) ?? [],
    )
    if (!tags.map((x) => x.textContent).some((x) => x && /^[#$]\w+$/i.test(x) && x.length <= 9)) return

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
