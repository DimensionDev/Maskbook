import type { Option } from 'ts-results'

export interface CollectNodeTextOptions {
    onHTMLAnchorElement?(node: HTMLAnchorElement): Option<string>
}

export function collectNodeText(node: HTMLElement | undefined, options: CollectNodeTextOptions = {}): string {
    if (!node) return ''
    if (!node.querySelector('a,img')) return node.innerText
    return [...node.childNodes]
        .map((each) => {
            if (each.nodeType === document.TEXT_NODE) return (each as Text).nodeValue || ''
            if (each instanceof HTMLAnchorElement) {
                const result = options.onHTMLAnchorElement?.(each)
                if (result?.some) return result.val
                const href = each.getAttribute('href')
                return href || each.innerText
                // return '\n' + (href.includes('l.facebook.com') ? new URL(href).searchParams.get('u') : each.innerText)
            }
            if (each instanceof HTMLImageElement) return each.alt
            if (each instanceof HTMLElement) return collectNodeText(each, options)
            return ''
        })
        .join('')
}
