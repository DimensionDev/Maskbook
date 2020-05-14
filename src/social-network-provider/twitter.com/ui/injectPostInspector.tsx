import type { PostInfo } from '../../../social-network/ui'
import { injectPostInspectorDefault } from '../../../social-network/defaults/injectPostInspector'
import { twitterEncoding } from '../encoding'

export function injectPostInspectorAtTwitter(current: PostInfo) {
    return injectPostInspectorDefault({
        zipPost(node) {
            const content = node.current.parentElement?.querySelector<HTMLDivElement>('[lang]')

            if (content) {
                for (const a of content.querySelectorAll('a')) {
                    if (twitterEncoding.payloadDecoder(a.title)) hideDOM(a)
                    if (a.title === 'http://maskbook.com') hideDOM(a)
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
    })(current)
}
function matches(str: string) {
    return str.includes('maskbook.com') && str.includes('Make Privacy Protected Again')
}

function hideDOM(a: HTMLElement) {
    a.style.width = '0'
    a.style.height = '0'
    a.style.overflow = 'hidden'
    a.style.display = 'inline-block'
}
