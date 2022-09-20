import { DOMProxy, IntervalWatcher } from '@dimensiondev/holoflows-kit'
import { creator, SocialNetworkUI as Next } from '../../../social-network/index.js'
import { postsContentSelector } from '../utils/selectors.js'

import { getCurrentUserInfo, getUserInfo } from './identity.js'
import { mirrorShared } from '../shared'
import { createRefsForCreatePostContext } from '../../../social-network/utils/create-post-context'
import { ProfileIdentifier } from '@masknet/shared-base'
import { mirrorBase } from '../base'

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
    const getPostId = (node: HTMLElement) => {
        const ele = node.querySelector('div > a') as HTMLLinkElement
        if (ele.href.startsWith('https')) {
            return ele.href.replace(MIRROR_LINK_PREFIX, '')
        }
        return ele.href.replace('/', '')
    }

    const baseInfo = getUserInfo()

    new IntervalWatcher(postsContentSelector())
        .useForeach((node, _, proxy) => {
            if (!node) return
            const postId = getPostId(node)
            const actionsElementProxy = DOMProxy({})
            actionsElementProxy.realCurrent = node.querySelector('a+div+a') as HTMLElement

            const refs = createRefsForCreatePostContext()
            const info = mirrorShared.utils.createPostContext({
                actionsElement: actionsElementProxy,
                comments: undefined,
                rootElement: proxy,
                suggestedInjectionPoint: (node.lastElementChild as HTMLElement) || (node as HTMLElement),
                ...refs.subscriptions,
            })
            refs.postID.value = postId
            refs.postBy.value = baseInfo?.identifier || null
            postStore.set(proxy, info)
        })
        // TODO: should return observe handler
        .assignKeys((node) => {
            if (!node) return
            return getPostId(node)
        })
        .startWatch(250, cancel)
}

export const PostProviderMirror: Next.CollectingCapabilities.PostsProvider = {
    posts: creator.EmptyPostProviderState(),
    start(cancel) {
        registerPostCollectorInner(this.posts, cancel)
    },
}
