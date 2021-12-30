import type { Option } from 'ts-results'

export function collectTwitterEmoji(points: number[]) {
    if (points.length === 0) return ''
    if (points[0] >= 0x23 && points[0] <= 0x39)
        return String.fromCodePoint(points[0], ...(points.includes(0xfe0f) ? [] : [0xfe0f]), ...points.slice(1))
    return String.fromCodePoint(...points)
}

export interface CollectNodeTextOptions {
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
                if (result?.some) return result.val
                const href = each.getAttribute('href')
                return [href, each.innerText].join(' ')
            }
            if (each instanceof HTMLImageElement) {
                const src = each.getAttribute('src')
                const alt = each.getAttribute('alt') ?? ''
                const matched = src?.match(/emoji\/v2\/svg\/([\w\-]+)\.svg/)?.[1]
                if (matched) return collectTwitterEmoji(matched.split('-').map((x) => Number.parseInt(x, 16))) || alt
                return alt
            }
            if (each instanceof HTMLElement) return collectNodeText(each, options)
            return ''
        })
        .join('')
}
