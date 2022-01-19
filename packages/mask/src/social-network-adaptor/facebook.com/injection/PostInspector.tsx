import { isMobileFacebook } from '../utils/isMobile'
import type { PostInfo } from '../../../social-network/PostInfo'
import { injectPostInspectorDefault } from '../../../social-network/defaults/inject/PostInspector'
import { Flags } from '../../../../shared'

const map = new WeakMap<HTMLElement, ShadowRoot>()
function getShadowRoot(node: HTMLElement) {
    if (map.has(node)) return map.get(node)!
    const dom = node.attachShadow({ mode: Flags.using_ShadowDOM_attach_mode })
    map.set(node, dom)
    return dom
}
export function injectPostInspectorFacebook(signal: AbortSignal, current: PostInfo) {
    clickSeeMore(current.rootElement.current?.parentElement)
    return injectPostInspectorDefault({
        injectionPoint: (post) => getShadowRoot(post.suggestedInjectionPoint),
    })(current, signal)
}
export function clickSeeMore(node: HTMLElement | undefined | null) {
    if (!node) return
    const more = node.querySelector<HTMLDivElement | HTMLSpanElement>(
        isMobileFacebook ? '[data-sigil="more"] a' : '[role=article] span[dir="auto"] div[dir="auto"] [role="button"]',
    )

    if (more && node.querySelector('img[alt="\u{1F3BC}"]')) {
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
