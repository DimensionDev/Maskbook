import type { Option } from 'ts-results-es'
import { collectTwitterEmoji } from './collectTwitterEmoji.js'

interface CollectNodeTextOptions {
    onHTMLAnchorElement?(node: HTMLAnchorElement): Option<string>
}

export function collectNodeText(node: HTMLElement | null | undefined, options: CollectNodeTextOptions = {}): string {
    if (!node) return ''
    if (!node.querySelector('a, img')) return node.innerText
    return [...node.childNodes]
        .map((each) => {
            if (each.nodeType === document.TEXT_NODE) return (each as Text).nodeValue || ''
            if (each instanceof HTMLAnchorElement) {
                const result = options.onHTMLAnchorElement?.(each)
                if (result?.isSome()) return result.value
                const href = each.getAttribute('href')
                return [href, each.innerText].join(' ')
            }
            if (each instanceof HTMLImageElement) {
                const src = each.getAttribute('src')
                const alt = each.getAttribute('alt') ?? ''
                const matched = src?.match(/emoji\/v2\/svg\/([\w-]+)\.svg/)?.[1]
                if (matched) return collectTwitterEmoji(matched.split('-').map((x) => Number.parseInt(x, 16))) || alt
                return alt
            }
            if (each instanceof HTMLElement) return collectNodeText(each, options)
            return ''
        })
        .join('')
}
