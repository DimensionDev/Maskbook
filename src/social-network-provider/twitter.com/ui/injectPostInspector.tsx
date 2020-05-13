import type { PostInfo } from '../../../social-network/ui'
import { injectPostInspectorDefault } from '../../../social-network/defaults/injectPostInspector'

export function injectPostInspectorAtTwitter(current: PostInfo) {
    return injectPostInspectorDefault({
        zipPost(node) {
            const content = node.current.parentElement?.querySelector<HTMLDivElement>('[lang]')

            if (content) {
                content.style.maxHeight = '1.5em'
                content.style.whiteSpace = 'nowrap'
                content.style.overflow = 'hidden'
                content.style.textOverflow = 'ellipsis'

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
