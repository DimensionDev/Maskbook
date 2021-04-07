import type { PostInfo } from '../../../social-network/PostInfo'
import { injectPostInspectorDefault } from '../../../social-network/defaults/inject/PostInspector'
import { twitterEncoding } from '../encoding'

export function injectPostInspectorAtTwitter(signal: AbortSignal, current: PostInfo) {
    return injectPostInspectorDefault({
        zipPost(node) {
            const content = node.current.parentElement?.querySelector<HTMLDivElement>('[lang]')

            if (content) {
                for (const a of content.querySelectorAll('a')) {
                    if (twitterEncoding.payloadDecoder(a.title)) hideDOM(a)
                    if (/^https?:\/\/mask(\.io|book\.com)$/i.test(a.title)) hideDOM(a)
                }
                for (const span of content.querySelectorAll('span')) {
                    // match (.) (\n) (—§—) (any space) (/*)
                    // Note: In Chinese we can't hide dom because "解密这条推文。\n—§—" is in the same DOM
                    // hide it will break the sentence.
                    if (span.innerText.match(/^\.\n—§— +\/\* $/)) hideDOM(span)
                    // match (any space) (*/) (any space)
                    if (span.innerText.match(/^ +\*\/ ?$/)) hideDOM(span)
                }

                const parent = content.parentElement?.nextElementSibling as HTMLElement
                if (parent && matches(parent.innerText)) {
                    parent.style.height = '0'
                    parent.style.overflow = 'hidden'
                }
            }
        },
    })(current, signal)
}
function matches(input: string) {
    return /maskbook\.com/i.test(input) && /Make Privacy Protected Again/i.test(input)
}

function hideDOM(a: HTMLElement) {
    a.style.width = '0'
    a.style.height = '0'
    a.style.overflow = 'hidden'
    a.style.display = 'inline-block'
}
