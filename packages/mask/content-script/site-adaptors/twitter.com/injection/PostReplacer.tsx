import type { PostInfo } from '@masknet/plugin-infra/content-script'
import { injectPostReplacer } from '../../../site-adaptor-infra/defaults/inject/PostReplacer.js'

function resolveLangNode(node: HTMLElement) {
    return node.hasAttribute('lang') ? node : (
            (node.querySelector<HTMLDivElement>('[lang]') ??
                node.parentElement?.querySelector<HTMLDivElement>('[lang]'))
        )
}

// There are different from what ScamWarning uses, they are not global
const EVM_ADDRESS = /(^|\s)(0x[\dA-Fa-f]{40})/
const SOLANA_ADDRESS = /(^|\s)([1-9A-HJ-NP-Za-km-z]{32,44})/
const TORN_ADDRESS = /(^|\s)(T[1-9A-Za-z]{33})/

function detectPotentialScam(postInfo: PostInfo) {
    const textContent = postInfo.rootNode?.textContent?.trim()
    if (!textContent) return false
    const hasAddresses =
        EVM_ADDRESS.test(textContent) || SOLANA_ADDRESS.test(textContent) || TORN_ADDRESS.test(textContent)
    const hasLinks = postInfo.mentionedLinks.getCurrentValue().length > 0
    return hasAddresses || hasLinks
}

export async function injectPostReplacerAtTwitter(signal: AbortSignal, current: PostInfo) {
    const rootNode = current.rootNode
    const hasPotentialScam = detectPotentialScam(current)
    if (!rootNode) return
    const isPromotionPost = !!rootNode.querySelector('svg path[d$="996V8h7v7z"]')
    if (isPromotionPost) return
    if (!hasPotentialScam) {
        const isCollapsedPost = !!rootNode.querySelector('[data-testid="tweet-text-show-more-link"]')
        if (isCollapsedPost) return

        const hasVideo = !!rootNode.closest('[data-testid="tweet"]')?.querySelector('video')
        if (hasVideo) return
        const hasEmbedImage = !!rootNode.querySelector('[data-testid="tweetText"] [data-testid="tweetPhoto"]')
        if (hasEmbedImage) return

        const tags = Array.from(
            rootNode.querySelectorAll<HTMLAnchorElement>(
                ['a[role="link"][href*="cashtag_click"]', 'a[role="link"][href*="hashtag_click"]'].join(','),
            ) ?? [],
        )
        if (!tags.map((x) => x.textContent).some((x) => x && /^[#$]\w+$/i.test(x) && x.length <= 9)) return
    }

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
