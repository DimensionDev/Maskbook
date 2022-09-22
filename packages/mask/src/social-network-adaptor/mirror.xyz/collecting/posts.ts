import { DOMProxy, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { creator, SocialNetworkUI as Next } from '../../../social-network/index.js'
import { postsContentSelector } from '../utils/selectors.js'

import { mirrorShared } from '../shared'
import { createRefsForCreatePostContext } from '../../../social-network/utils/create-post-context'
import { startWatch } from '../../../utils'
import { formatWriter, mirrorPageProbe, MirrorPageType } from './utils'
import type { ProfileIdentifier } from '@masknet/shared-base'

const MIRROR_LINK_PREFIX = /https(.*)mirror.xyz(.*)\//g

export function queryInjectPoint(node: HTMLElement) {
    const allANode = node.querySelectorAll(
        [
            ':scope > div:nth-child(3) div+a',
            ':scope > div:nth-child(1) footer span > div > div',
            ':scope > div:nth-child(3) a+div',
        ].join(),
    )
    return allANode.item(allANode.length - 1) as HTMLElement
}

async function registerPostCollectorInner(
    postStore: Next.CollectingCapabilities.PostsProvider['posts'],
    cancel: AbortSignal,
) {
    const getPostId = (node: HTMLElement | HTMLLinkElement) => {
        // Handle entry detail page post id
        if (mirrorPageProbe(location.href) === MirrorPageType.Post) {
            return location.href.replace(MIRROR_LINK_PREFIX, '')
        }

        const ele = node.querySelector('div > a') as HTMLLinkElement
        const href = ele?.href || (node as HTMLLinkElement)?.href

        if (href?.startsWith('https')) {
            return href.replace(MIRROR_LINK_PREFIX, '')
        }

        if (href) return href?.replace('/', '')

        return ''
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

    function collectPostInfo(
        node: HTMLElement | null,
        info: ReturnType<typeof createRefsForCreatePostContext>,
        cancel: AbortSignal,
    ) {
        if (!node) return
        if (cancel?.aborted) return
        const postId = getPostId(node)
        const postWriters = getPostWriters(postId)
        info.postID.value = postId

        info.postBy.value = postWriters?.author.identifier || null
        info.postCoAuthors.value =
            (postWriters?.coAuthors.map((x) => x.identifier).filter(Boolean) as ProfileIdentifier[]) || []
    }

    startWatch(
        new MutationObserverWatcher(postsContentSelector()).useForeach((node, key, proxy) => {
            if (!node) return

            const actionsElementProxy = DOMProxy({})
            actionsElementProxy.realCurrent = queryInjectPoint(node)

            const refs = createRefsForCreatePostContext()
            const postInfo = mirrorShared.utils.createPostContext({
                actionsElement: actionsElementProxy,
                comments: undefined,
                rootElement: proxy,
                suggestedInjectionPoint: (node.lastElementChild as HTMLElement) || (node as HTMLElement),
                ...refs.subscriptions,
            })

            function run() {
                collectPostInfo(node, refs, cancel)
            }
            run()

            postStore.set(proxy, postInfo)

            return {
                onNodeMutation: run,
                onTargetChanged: run,
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
