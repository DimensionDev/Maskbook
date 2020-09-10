import type { DOMProxy } from '@holoflows/kit'
import { isMobileFacebook } from '../isMobile'
import type { PostInfo } from '../../../social-network/PostInfo'
import { injectPostInspectorDefault } from '../../../social-network/defaults/injectPostInspector'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'

const map = new Map<HTMLElement, ShadowRoot>()
function getShadowRoot(node: HTMLElement) {
    if (map.has(node)) return map.get(node)!
    const dom = node.attachShadow({ mode: webpackEnv.shadowRootMode })
    map.set(node, dom)
    return dom
}
export function injectPostInspectorFacebook(current: PostInfo) {
    clickSeeMore(current.rootNodeProxy)
    return injectPostInspectorDefault({
        zipPost(node) {
            zipEncryptedPostContent(node)
            zipPostLinkPreview(node)
        },
        render(jsx, postInfo) {
            return renderInShadowRoot(jsx, {
                shadow: () => getShadowRoot(postInfo.postContentNode!),
                normal: () => getShadowRoot(postInfo.postContentNode!) as any,
                concurrent: true,
            })
        },
    })(current)
}
function zipPostLinkPreview(node: DOMProxy) {
    const parentEle = node.current.parentElement!
    if (isMobileFacebook) {
        const img =
            parentEle.querySelector('a[href*="maskbook.io"]') || parentEle.querySelector('a[href*="maskbook.com"]')
        const parent = img && img.closest('section')
        if (img && parent) {
            parent.style.display = 'none'
        }
    } else {
        const img =
            parentEle.querySelector('a[href*="maskbook.io"] img') ||
            parentEle.querySelector('a[href*="maskbook.com"] img')
        const parent = img && img.closest('span')
        if (img && parent) {
            parent.style.display = 'none'
        }
    }
}
function zipEncryptedPostContent(node: DOMProxy) {
    const parent = node.current.parentElement
    // It's image based encryption, skip zip post.
    if (!node.current.innerText.includes('🎼')) return
    // Style modification for repost
    if (!node.current.className.includes('userContent') && node.current.innerText.length > 0) {
        node.after.setAttribute(
            'style',
            `border: 1px solid #ebedf0;
display: block;
border-top: none;
border-bottom: none;
margin-bottom: 0px;
padding: 0px 10px;`,
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
function clickSeeMore(node: DOMProxy) {
    const more = node.current.parentElement!.querySelector<HTMLDivElement | HTMLSpanElement>(
        isMobileFacebook ? '[data-sigil="more"] a' : '.see_more_link_inner',
    )
    if (more && node.current.innerText.includes('🎼')) {
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
