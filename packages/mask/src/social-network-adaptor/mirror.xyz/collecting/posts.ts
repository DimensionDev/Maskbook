import { DOMProxy, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Mirror } from '@masknet/web3-providers'
import type { PostContextCoAuthor } from '@masknet/plugin-infra/content-script'
import type { SiteAdaptorUI } from '@masknet/types'
import { creator } from '../../../social-network/index.js'
import { postsContentSelector } from '../utils/selectors.js'
import { mirrorShared } from '../shared.js'
import { startWatch } from '../../../utils/startWatch.js'
import { createRefsForCreatePostContext } from '../../../social-network/utils/create-post-context.js'
import { formatWriter, getMirrorPageType, MirrorPageType, MIRROR_ENTRY_ID } from './utils.js'

const MIRROR_LINK_PREFIX = /https(.*)mirror.xyz(.*)\//i

export function queryInjectPoint(node: HTMLElement) {
    const allANode = node.querySelectorAll(
        [
            // workaround for case: only have one contributor in entry detail page
            // Not find better selector
            /* cspell:disable-next-line */
            ':scope > div:nth-child(3) > div > div > div:has(div._1sjywpl0._1sjywpl1.bc5nci3lg.bc5nci3rz):not(svg)',
            /* cspell:disable-next-line */
            ':scope > div:nth-child(4) > div > div > div:has(div._1sjywpl0._1sjywpl1.bc5nci3lg.bc5nci3rz):not(svg)',

            // if have header image is 4, either 3
            ':scope > div:nth-child(3) div:has(div > div > div+a)~div',
            ':scope > div:nth-child(4) div:has(div > div > div+a)~div',
            ':scope > div:nth-child(3) div:has(div > div > div+a)~div~a',
            ':scope > div:nth-child(4) div:has(div > div > div+a)~div~a',

            // collection page card footer
            ':scope > div:nth-child(1) footer span > div > div',
            // if have header image is 4, either 3 entries: time + entry link
            ':scope > div:nth-child(3) div+a',
            ':scope > div:nth-child(4) div+a',

            // if have header image is 4, either 3 entry: address link + time
            ':scope > div:nth-child(3) > div > div > a~div',
            ':scope > div:nth-child(4) > div > div > a~div',
        ].join(','),
    )
    return allANode.item(allANode.length - 1) as HTMLElement
}

const getPostId = (node: HTMLElement | HTMLLinkElement) => {
    // Handle entry detail page post id
    if (getMirrorPageType(location.href) === MirrorPageType.Post) {
        return location.pathname.match(MIRROR_ENTRY_ID)?.[0]
    }

    const ele = node.querySelector<HTMLLinkElement>('div > a')
    const href = ele?.href || (node as HTMLLinkElement)?.href

    if (href?.startsWith('https')) {
        return href.replace(MIRROR_LINK_PREFIX, '')
    }

    if (href) return href?.replace('/', '')

    return ''
}

async function collectPostInfo(node: HTMLElement | null, cancel: AbortSignal) {
    if (!node) return
    if (cancel?.aborted) return
    const postId = getPostId(node)
    if (!postId) return
    const publisher = await Mirror.getPostPublisher(postId)
    if (!publisher) return
    return {
        postId,
        writers: {
            author: formatWriter(publisher.author, false),
            coAuthors: publisher?.coAuthors.map((x) => formatWriter(x, false)),
        },
    }
}

async function registerPostCollectorInner(
    postStore: SiteAdaptorUI.CollectingCapabilities.PostsProvider['posts'],
    cancel: AbortSignal,
) {
    startWatch(
        new MutationObserverWatcher<HTMLElement>(postsContentSelector()).useForeach((node, key, proxy) => {
            if (!node) return

            const actionsElementProxy = DOMProxy({})
            actionsElementProxy.realCurrent = queryInjectPoint(node)

            const refs = createRefsForCreatePostContext()
            const postInfo = mirrorShared.utils.createPostContext({
                actionsElement: actionsElementProxy,
                comments: undefined,
                rootElement: proxy,
                suggestedInjectionPoint: (node.lastElementChild as HTMLElement) || node,
                ...refs.subscriptions,
            })

            function run() {
                collectPostInfo(node, cancel).then((result) => {
                    if (!result) return

                    refs.postID.value = result.postId
                    refs.postBy.value = result.writers?.author.identifier || null
                    refs.nickname.value = result.writers?.author.nickname || null
                    refs.avatarURL.value = result.writers?.author.avatar || null
                    refs.postCoAuthors.value =
                        (result?.writers?.coAuthors
                            .map((x) => ({
                                nickname: x.nickname,
                                avatarURL: x.avatar ? new URL(x.avatar) : undefined,
                                author: x.identifier,
                                snsID: x.identifier?.userId,
                            }))
                            .filter(Boolean) as PostContextCoAuthor[]) || []
                })
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

export const PostProviderMirror: SiteAdaptorUI.CollectingCapabilities.PostsProvider = {
    posts: creator.EmptyPostProviderState(),
    start(cancel) {
        registerPostCollectorInner(this.posts, cancel)
    },
}
