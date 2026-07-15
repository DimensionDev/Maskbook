/* eslint @masknet/unicode-specific-set: ["error", { "only": "code" }] */
import { TwitterDecoder } from '@masknet/encryption'
import type { PostInfo } from '@masknet/plugin-infra/content-script'
import { getOrAttachShadowRoot } from '@masknet/shared-base-ui'
import { injectPostInspectorDefault } from '../../../site-adaptor-infra/defaults/inject/PostInspector.js'
import { removeUrlParam } from '../utils/url.js'

export function injectPostInspectorAtTwitter(signal: AbortSignal, current: PostInfo) {
    const inject = injectPostInspectorDefault({
        injectionPoint(postInfo) {
            if (postInfo.rootElement.realCurrent!.dataset.testid === 'tweetPhoto') {
                const root = postInfo.rootElement.realCurrent!.closest('div[aria-labelledby]')! as HTMLDivElement
                return getOrAttachShadowRoot(root)
            }
            return postInfo.rootElement.afterShadow
        },
        zipPost(node, payloadContext) {
            if (node.destroyed) return
            const contentContainer = node.current.parentElement
            if (!contentContainer) return

            const content = contentContainer.querySelector<HTMLDivElement>('[lang]')
            if (!content) return

            for (const a of content.querySelectorAll('a')) {
                if (TwitterDecoder(a.title).isSome()) hideDOM(a)

                if (/^https?:\/\/mask(\.io|book\.com)$/iu.test(a.title)) hideDOM(a)
            }
            for (const span of content.querySelectorAll('span')) {
                // match (.) (\n) (—§—) (any space) (/*)
                // Note: In Chinese we can't hide dom because "解密这条推文。\n—§—" is in the same DOM
                // hide it will break the sentence.
                if (/^\.\n\u{2014}\u{A7}\u{2014} +\/\* $/u.test(span.textContent)) hideDOM(span)
                // match (any space) (*/) (any space)
                if (/^ +\*\/ ?$/u.test(span.textContent)) hideDOM(span)
            }
            const article = contentContainer.closest('article')
            if (article && payloadContext?.imageDecryptedResults?.length) {
                const encryptedImages = new Set(
                    payloadContext.imageDecryptedResults.map((url) => removeUrlParam(url, 'name')),
                )
                for (const img of article.querySelectorAll('img')) {
                    // ?name=orig is added or modified to during post collection, see ../utils/fetch.ts
                    const originUrl = removeUrlParam(img.src, 'name')
                    if (!encryptedImages.has(originUrl)) continue
                    const a = img.closest<HTMLElement>('a[href*="/photo/"][role=link]')
                    if (!a) continue
                    hideDOM(a)
                    const wrapper = a.closest<HTMLElement>('div[aria-labelledby]')
                    if (wrapper?.textContent === '') {
                        wrapper.style.display = 'none'
                        wrapper.setAttribute('aria-hidden', 'true')
                    }
                }
            }

            const parent = content.parentElement?.nextElementSibling as HTMLElement
            if (parent && matches(parent.textContent)) {
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
    })
    return inject(current, signal)
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
