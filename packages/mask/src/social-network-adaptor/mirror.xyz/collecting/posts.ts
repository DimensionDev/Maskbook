import { DOMProxy, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { creator, SocialNetworkUI as Next } from '../../../social-network/index.js'
import { postsContentSelector } from '../utils/selectors.js'

import { mirrorShared } from '../shared'
import { createRefsForCreatePostContext } from '../../../social-network/utils/create-post-context'
import { startWatch } from '../../../utils'
import { noop } from 'lodash-unified'
import { formatWriter } from './utils'
import type { ProfileIdentifier } from '@masknet/shared-base'

const MIRROR_LINK_PREFIX = /https(.*)mirror.xyz\//g

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
        return href?.replace('/', '')
    }

    // TODO: align this method
    const getPostWriters = (postId: string) => {
        const script = document.getElementById('__NEXT_DATA__')?.innerHTML
        if (!script) return
        const INIT_DATA = JSON.parse(script)
        if (!INIT_DATA) return
        const publisher = INIT_DATA.props?.pageProps?.__APOLLO_STATE__?.[`entry:${postId}`]?.publisher
        if (!publisher) return
        return {
            author: formatWriter({
                address: publisher?.project?.__ref.replace('ProjectType:', '') as string,
                avatarURL: '',
            }),
            coAuthors: [
                formatWriter({
                    address: publisher?.member.__ref.replace('ProjectType:', '') as string,
                    avatarURL: '',
                }),
            ],
        }
    }

    startWatch(
        new MutationObserverWatcher(postsContentSelector()).useForeach((node, key, proxy) => {
            if (!node) return
            const postId = getPostId(node)
            const postWriters = getPostWriters(postId)

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
            refs.postBy.value = postWriters?.author.identifier || null
            refs.postCoAuthors.value =
                (postWriters?.coAuthors.map((x) => x.identifier).filter(Boolean) as ProfileIdentifier[]) || []
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
