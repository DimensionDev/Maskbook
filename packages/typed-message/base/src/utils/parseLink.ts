// Note: this package is published as is, therefore we cannot ship the syntax nor change the module target.
// eslint-disable-next-line @masknet/prefer-defer-import
import * as anchorme from /* webpackDefer: true */ 'anchorme'
import type { TypedMessageAnchor } from '../extension/index.js'

export type ParseLinkResult =
    | {
          type: 'text'
          content: string
      }
    | {
          type: 'link'
          content: string
          category: TypedMessageAnchor['category']
      }

export function parseLink(text: string): ParseLinkResult[] {
    // ESM-CJS interop
    const parsed = (anchorme.default.default || anchorme.default).list(text)

    const result: ParseLinkResult[] = []

    let start = 0
    for (const x of parsed) {
        if (x.isURL) {
            result.push(
                { type: 'text', content: text.slice(start, x.start) },
                { type: 'link', content: x.string, category: 'normal' },
            )
        } else {
            result.push({ type: 'text', content: text.slice(start, x.end) })
        }
        start = x.end
    }
    result.push({ type: 'text', content: text.slice(start) })
    return result.filter((x) => x.content).flatMap((x) => (x.type === 'text' ? parseTag(x.content) : x))
}

const TagLike = /([#$@][\w-]+)/gu
const map = {
    '@': 'user',
    '#': 'hash',
    $: 'cash',
} as const
function parseTag(x: string): ParseLinkResult[] {
    return x
        .split(TagLike)
        .map<ParseLinkResult>((x) =>
            TagLike.test(x) ?
                { type: 'link', content: x, category: map[x[0] as keyof typeof map] || 'normal' }
            :   { type: 'text', content: x },
        )
}
