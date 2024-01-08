import { DOMProxy, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Mirror } from '@masknet/web3-providers'
import type { PostContextCoAuthor } from '@masknet/plugin-infra/content-script'
import type { SiteAdaptorUI } from '@masknet/types'
import { creator } from '../../../site-adaptor-infra/index.js'
import { postsContentSelector } from '../utils/selectors.js'
import { mirrorShared } from '../shared.js'
import { startWatch } from '../../../utils/startWatch.js'
import { createRefsForCreatePostContext } from '../../../site-adaptor-infra/utils/create-post-context.js'
import { formatWriter, getMirrorPageType, MirrorPageType, MIRROR_ENTRY_ID } from './utils.js'
import { EnhanceableSite, PostIdentifier } from '@masknet/shared-base'
import { getAuthorWallet } from '../utils/user.js'

const MIRROR_LINK_PREFIX = /https(.*)mirror.xyz(.*)\//i

function queryInjectPoint(node: HTMLElement) {
    const authorWallet = getAuthorWallet()
    const isENS = authorWallet.endsWith('.eth')
    const id = isENS ? authorWallet.slice(0, -4) : authorWallet
    const allANode = node.querySelectorAll(
        [
            // post detail header
            isENS ?
                `:scope [href^="https://${id}.mirror.xyz" i]:has(img[alt^="0x" i][decoding="async"]) > div:last-of-type` // img alt is always address
            :   `:scope [href$="/${id}" i]:has(img[alt^="0x" i][decoding="async"]) > div:last-of-type`, // img alt is always address
            // collection page card footer
            ':scope header div:has(> span img[alt="Publisher"])',
        ].join(','),
    )
    return allANode.item(allANode.length - 1) as HTMLElement
}

function getPostId(node: HTMLElement | HTMLLinkElement) {
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
                site: EnhanceableSite.Mirror,
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
                        result?.writers?.coAuthors
                            .map(
                                (x): PostContextCoAuthor =>
                                    x.identifier ?
                                        {
                                            author: x.identifier,
                                            avatarURL: x.avatar ? new URL(x.avatar) : undefined,
                                            post: new PostIdentifier(x.identifier, result.postId),
                                            nickname: x.nickname,
                                        }
                                    :   undefined!,
                            )
                            .filter(Boolean) || []
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
