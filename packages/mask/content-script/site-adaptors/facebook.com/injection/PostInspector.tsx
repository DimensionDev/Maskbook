import type { DOMProxy } from '@dimensiondev/holoflows-kit'
import type { PostInfo } from '@masknet/plugin-infra/content-script'
import { injectPostInspectorDefault } from '../../../site-adaptor-infra/defaults/inject/PostInspector.js'
import { getOrAttachShadowRoot } from '@masknet/shared-base-ui'

export function injectPostInspectorFacebook(signal: AbortSignal, current: PostInfo) {
    clickSeeMore(current.rootElement.current?.parentElement)
    return injectPostInspectorDefault({
        zipPost(node) {
            zipEncryptedPostContent(node)
            zipPostLinkPreview(node)
        },
        injectionPoint: (post) => getOrAttachShadowRoot(post.suggestedInjectionPoint),
    })(current, signal)
}
function zipPostLinkPreview(node: DOMProxy) {
    if (node.destroyed) return
    const parentEle = node.current.parentElement
    if (!parentEle) return
    const img =
        parentEle.querySelector('a[href*="maskbook.io"] img') ??
        parentEle.querySelector('a[href*="mask.io"] img') ??
        parentEle.querySelector('a[href*="maskbook.com"] img')
    const parent = img?.closest('span')
    if (img && parent) {
        parent.style.display = 'none'
    }
}
function zipEncryptedPostContent(node: DOMProxy) {
    if (node.destroyed) return
    const parent = node.current.parentElement
    // It's image based encryption, skip zip post.
    if (!node.current.innerText.includes('\uD83C\uDFBC')) return
    // Style modification for repost
    if (!node.current.className.includes('userContent') && node.current.innerText.length > 0) {
        node.after.setAttribute(
            'style',
            `border: 1px solid #ebedf0;
display: block;
border-top: none;
border-bottom: none;
margin-bottom: 0;
padding: 0 10px;`,
        )
    }
    if (parent) {
        // post content
        const p = parent.querySelector('p')
        if (p) {
            p.style.display = 'block'
            p.style.maxHeight = '20px'
            p.style.overflow = 'hidden'
            p.style.marginBottom = '0'
        }
    }
}
export function clickSeeMore(node: HTMLElement | undefined | null) {
    if (!node) return
    const more = node.querySelector<HTMLDivElement | HTMLSpanElement>(
        '[role=article] span[dir="auto"] div[dir="auto"] [role="button"]',
    )

    if (more && node.querySelector('img[alt="\uD83C\uDFBC"]')) {
        const trap = (e: Event) => {
            e.preventDefault()
        }
        more.parentNode!.addEventListener('click', trap)
        more.click()
        setTimeout(() => {
            if (more.parentNode) more.parentNode.removeEventListener('click', trap)
        }, 0)
    }
}
