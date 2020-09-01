import type { PostInfo } from '../../../social-network/PostInfo'
import { injectPostDummyDefault } from '../../../social-network/defaults/injectPostDummy'

function resolveLangNode(node: HTMLElement) {
    return node.hasAttribute('lang') ? node : node.querySelector<HTMLDivElement>('[lang]')
}

export function injectPostDummyAtTwitter(current: PostInfo) {
    return injectPostDummyDefault({
        zipPost(node) {
            const langNode = resolveLangNode(node.current)
            if (langNode) langNode.style.display = 'none'
        },
        unzipPost(node) {
            const langNode = resolveLangNode(node.current)
            if (langNode) langNode.style.display = 'unset'
        },
    })(current)
}
