import { DOMProxy, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { creator, SocialNetworkUI as Next } from '../../../social-network/index.js'
import { postsContentSelector } from '../utils/selectors.js'

import { getCurrentUserInfo, getUserInfo } from './identity.js'
import { mirrorShared } from '../shared'
import { createRefsForCreatePostContext } from '../../../social-network/utils/create-post-context'
import { ProfileIdentifier } from '@masknet/shared-base'
import { mirrorBase } from '../base'
import { startWatch } from '../../../utils'
import { noop } from 'lodash-unified'

const MIRROR_LINK_PREFIX = /https(.*)mirror.xyz\//g

async function collectPostInfo(cancel: AbortSignal) {
    if (cancel?.aborted) return

    const user = await getCurrentUserInfo()
    if (!user) return

    return {
        postBy: ProfileIdentifier.of(mirrorBase.networkIdentifier, user.address).unwrapOr(null),
    }
}

async function registerPostCollectorInner(
    postStore: Next.CollectingCapabilities.PostsProvider['posts'],
    cancel: AbortSignal,
) {
    const getPostId = (node: HTMLElement | HTMLLinkElement) => {
        const ele = node.querySelector('div > a') as HTMLLinkElement
        const href = ele?.href || (node as HTMLLinkElement)?.href
        if (href?.startsWith('https')) {
            return href.replace(MIRROR_LINK_PREFIX, '')
        }
        return href.replace('/', '')
    }

    const baseInfo = getUserInfo()

    startWatch(
        new MutationObserverWatcher(postsContentSelector()).useForeach((node, key, proxy) => {
            if (!node) return
            const postId = getPostId(node)

            const actionsElementProxy = DOMProxy({})
            const allANode = node.querySelectorAll(['div+a', 'footer span > div'].join())
            actionsElementProxy.realCurrent = allANode.item(allANode.length - 1) as HTMLElement

            const refs = createRefsForCreatePostContext()
            const postInfo = mirrorShared.utils.createPostContext({
                actionsElement: actionsElementProxy,
                comments: undefined,
                rootElement: proxy,
                suggestedInjectionPoint: (node.lastElementChild as HTMLElement) || (node as HTMLElement),
                ...refs.subscriptions,
            })
            refs.postID.value = postId
            refs.postBy.value = baseInfo?.identifier || null
            postStore.set(proxy, postInfo)

            return {
                onNodeMutation: noop,
                onTargetChanged: noop,
                onRemove: () => postStore.delete(proxy),
            }
        }),
        cancel,
    )
}

export const PostProviderMirror: Next.CollectingCapabilities.PostsProvider = {
    posts: creator.EmptyPostProviderState(),
    start(cancel) {
        registerPostCollectorInner(this.posts, cancel)
    },
}
