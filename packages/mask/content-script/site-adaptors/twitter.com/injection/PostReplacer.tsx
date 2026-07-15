import type { PostInfo } from '@masknet/plugin-infra/content-script'
import { EXIST_EVM_ADDRESS_RE, EXIST_SOLANA_ADDRESS_RE, EXIST_TORN_ADDRESS_RE } from '@masknet/shared-base'
import { injectPostReplacer } from '../../../site-adaptor-infra/defaults/inject/PostReplacer.js'

function resolveLangNode(node: HTMLElement) {
    return node.hasAttribute('lang') ? node : (
            (node.querySelector<HTMLDivElement>('[lang]') ??
                node.parentElement?.querySelector<HTMLDivElement>('[lang]'))
        )
}

function detectPotentialScam(postInfo: PostInfo) {
    const textContent = postInfo.rootNode?.textContent?.trim()
    if (!textContent) return false
    const hasAddresses =
        EXIST_EVM_ADDRESS_RE.test(textContent) ||
        EXIST_SOLANA_ADDRESS_RE.test(textContent) ||
        EXIST_TORN_ADDRESS_RE.test(textContent)
    const hasLinks = postInfo.mentionedLinks.getCurrentValue().length > 0
    return hasAddresses || hasLinks
}

export async function injectPostReplacerAtTwitter(signal: AbortSignal, current: PostInfo) {
    const rootNode = current.rootNode
    if (!rootNode) return
    const isPromotionPost = !!rootNode.querySelector(':scope svg path[d$="996V8h7v7z"]')
    if (isPromotionPost) return

    const hasPotentialScam = detectPotentialScam(current)
    if (!hasPotentialScam) {
        const isCollapsedPost = !!rootNode.querySelector('[data-testid="tweet-text-show-more-link"]')
        if (isCollapsedPost) return

        const hasVideo = !!rootNode.closest('[data-testid="tweet"]')?.querySelector('video')
        if (hasVideo) return
        const hasEmbedImage = !!rootNode.querySelector(':scope [data-testid="tweetText"] [data-testid="tweetPhoto"]')
        if (hasEmbedImage) return

        const tags = rootNode.querySelectorAll<HTMLAnchorElement>(
            [
                'a[role="link"][href*="cashtag_click"]',
                'a[role="link"][href*="hashtag_click"]',
                // in communities post <a href="/i/communities/1722516678070972815/hashtag/BTC" />
                'a[role="link"][href*="/i/communities/"][href*="/hashtag/"]',
            ].join(','),
        )
        const mentions = rootNode
            .querySelectorAll<HTMLAnchorElement>(
                [
                    'a[href^="/"]:not([role="link"][href*="mention_click"])',
                    'a[href^="/"]:not([role="link"][href*="/i/communities/"][href*="/mention/"])',
                    'a[href^="/"]:not([role="link"][href*="/i/communities/"][href*="/hashtag/"])',
                ].join(','),
            )
            .values()
            .filter((x) => x.textContent?.startsWith('@'))
            .toArray()
        if (!tags.length && !mentions.length) return
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
