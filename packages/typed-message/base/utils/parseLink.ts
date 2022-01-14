import _anchorme from 'anchorme'
// ESM/CJS compat
const anchorme = ((_anchorme as any).default || _anchorme) as typeof _anchorme

export interface ParseLinkResult {
    type: 'url' | 'text'
    content: string
}

export function parseLink(text: string): ParseLinkResult[] {
    const parsed = anchorme.list(text)

    const result: ParseLinkResult[] = []

    let start = 0
    for (const x of parsed) {
        if (x.isURL) {
            result.push({ type: 'text', content: text.slice(start, x.start) })
            result.push({ type: 'url', content: x.string })
        } else {
            result.push({ type: 'text', content: text.slice(start, x.end) })
        }
        start = x.end
    }
    result.push({ type: 'text', content: text.slice(start, text.length) })
    return result.filter((x) => x.content)
}
