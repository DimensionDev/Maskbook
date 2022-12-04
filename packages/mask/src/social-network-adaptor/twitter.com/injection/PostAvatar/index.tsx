import type { PostInfo } from '@masknet/plugin-infra/content-script'
import { Flags } from '../../../../../shared/index.js'
import { createPostAvatarInjector } from '../../../../social-network/defaults/inject/PostAvatar.js'

function getPostsAvatarNode(postNode: HTMLElement | null) {
    if (!postNode) return null
    return postNode
        .closest('[data-testid="tweet"]')
        ?.querySelector<HTMLElement>('div div[data-testid="Tweet-User-Avatar"] a')
}

export function injectPostAvatarAtTwitter(signal: AbortSignal, postInfo: PostInfo) {
    if (!Flags.post_actions_enabled) return
    const injector = createPostAvatarInjector({
        zipAvatar(node) {
            if (node.destroyed) return
            const langNode = getPostsAvatarNode(node.current)
            if (langNode) langNode.style.display = 'none'
        },
        unzipAvatar(node) {
            if (node.destroyed || !node.current) return
            const langNode = getPostsAvatarNode(node.current)
            if (langNode) langNode.style.display = 'unset'
        },
    })
    return injector(postInfo, signal)
}
