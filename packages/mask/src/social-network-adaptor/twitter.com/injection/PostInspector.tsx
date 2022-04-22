/* eslint @dimensiondev/unicode/specific-set: ["error", { "only": "code" }] */
import { TwitterDecoder } from '@masknet/encryption'
import type { PostInfo } from '@masknet/plugin-infra/content-script'
import { injectPostInspectorDefault } from '../../../social-network/defaults/inject/PostInspector'

export function injectPostInspectorAtTwitter(signal: AbortSignal, current: PostInfo) {
    return injectPostInspectorDefault({
        zipPost(node) {
            const contentContainer = node.current.parentElement
            if (!contentContainer) return

            const content = contentContainer.querySelector<HTMLDivElement>('[lang]')
            if (!content) return

            for (const a of content.querySelectorAll('a')) {
                if (TwitterDecoder(a.title).some) hideDOM(a)

                if (/^https?:\/\/mask(\.io|book\.com)$/i.test(a.title)) hideDOM(a)
            }
            for (const span of content.querySelectorAll('span')) {
                // match (.) (\n) (—§—) (any space) (/*)
                // Note: In Chinese we can't hide dom because "解密这条推文。\n—§—" is in the same DOM
                // hide it will break the sentence.
                if (span.innerText.match(/^\.\n\u2014\u00A7\u2014 +\/\* $/)) hideDOM(span)
                // match (any space) (*/) (any space)
                if (span.innerText.match(/^ +\*\/ ?$/)) hideDOM(span)
            }

            const parent = content.parentElement?.nextElementSibling as HTMLElement
            if (parent && matches(parent.innerText)) {
                parent.style.height = '0'
                parent.style.overflow = 'hidden'
            }

            const cardWrapper =
                contentContainer.parentElement?.querySelector<HTMLDivElement>('[data-testid="card.wrapper"]')
            if (cardWrapper) {
                cardWrapper.style.display = 'none'
                cardWrapper.setAttribute('aria-hidden', 'true')
            }
        },
    })(current, signal)
}
function matches(input: string) {
    input = input.toLowerCase()
    return input.includes('maskbook.com') && input.includes('make privacy protected again')
}

function hideDOM(a: HTMLElement) {
    a.style.width = '0'
    a.style.height = '0'
    a.style.overflow = 'hidden'
    a.style.display = 'inline-block'
}
