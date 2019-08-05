import { DomProxy } from '@holoflows/kit'
import { isMobileFacebook } from '../isMobile'
import { PostInfo } from '../../../social-network/ui'
import { injectPostInspectorDefault } from '../../../social-network/defaults/injectPostInspector'

const defaultBehavior = injectPostInspectorDefault({
    zipPost(node) {
        zipEncryptedPostContent(node)
        zipPostLinkPreview(node)
    },
})
export function injectPostInspectorFacebook(
    current: PostInfo,
    node: DomProxy<HTMLDivElement & Node, HTMLSpanElement, HTMLSpanElement>,
) {
    clickSeeMore(node)
    return defaultBehavior(current, node)
}
function zipPostLinkPreview(node: DomProxy) {
    if (isMobileFacebook) {
        const img = node.current.parentElement!.querySelector('a[href*="maskbook.io"]')
        const parent = img && img.closest('section')
        if (img && parent) {
            parent.style.display = 'none'
        }
    } else {
        const img = node.current.parentElement!.querySelector('a[href*="maskbook.io"] img')
        const parent = img && img.closest('span')
        if (img && parent) {
            parent.style.display = 'none'
        }
    }
}
function zipEncryptedPostContent(node: DomProxy) {
    const parent = node.current.parentElement
    // Style modification for repost
    if (!node.current.className.match('userContent') && node.current.innerText.length > 0) {
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
function clickSeeMore(node: DomProxy) {
    const more = node.current.parentElement!.querySelector<HTMLSpanElement>('.see_more_link_inner')
    if (!isMobileFacebook && more && node.current.innerText.match(/🎼.+|/)) {
        more.click()
    }
}
