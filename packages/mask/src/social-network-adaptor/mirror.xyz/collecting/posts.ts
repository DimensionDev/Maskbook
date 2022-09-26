import { DOMProxy, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { creator, SocialNetworkUI as Next } from '../../../social-network/index.js'
import { postsContentSelector } from '../utils/selectors.js'

import { mirrorShared } from '../shared'
import { createRefsForCreatePostContext } from '../../../social-network/utils/create-post-context'
import { startWatch } from '../../../utils'
import { formatWriter, getMirrorPageType, MirrorPageType } from './utils'
import { Mirror } from '@masknet/web3-providers'
import type { PostContextCoAuthor } from '@masknet/plugin-infra/content-script'

const MIRROR_LINK_PREFIX = /https(.*)mirror.xyz(.*)\//i

export function queryInjectPoint(node: HTMLElement) {
    const allANode = node.querySelectorAll(
        [
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
        ].join(),
    )
    return allANode.item(allANode.length - 1) as HTMLElement
}

const getPostId = (node: HTMLElement | HTMLLinkElement) => {
    // Handle entry detail page post id
    if (getMirrorPageType(location.href) === MirrorPageType.Post) {
        return location.pathname.match(/\w{43}/i)?.[0]
    }

    const ele = node.querySelector<HTMLLinkElement>('div > a')
    const href = ele?.href || (node as HTMLLinkElement)?.href

    if (href?.startsWith('https')) {
        return href.replace(MIRROR_LINK_PREFIX, '')
    }

    if (href) return href?.replace('/', '')

    return ''
}

const getPostWriters = async (postId: string) => {
    const script = document.getElementById('__NEXT_DATA__')?.innerHTML
    if (!script) return
    const INIT_DATA = JSON.parse(script)

    function getAuthorDetail(address?: string) {
        const author = INIT_DATA?.props?.pageProps?.__APOLLO_STATE__?.[`ProjectType:${address}`]
        return {
            displayName: author?.displayName,
            avatarURL: author?.avatarURL,
            domain: author?.domain,
        }
    }

    const publisher = INIT_DATA?.props?.pageProps?.__APOLLO_STATE__?.[`entry:${postId}`]?.publisher
    if (!publisher) {
        // get publisher from api
        const post = await Mirror.getPost(postId)
        if (!post) return

        return {
            author: formatWriter(post.author),
            coAuthors: post.coAuthors.map(formatWriter),
        }
    } else {
        // get publisher from local
        return {
            author: formatWriter({
                address: publisher?.project?.__ref.replace('ProjectType:', '') as string,
                ...getAuthorDetail(publisher?.project?.__ref.replace('ProjectType:', '') as string),
            }),
            coAuthors: [
                formatWriter({
                    address: publisher?.member.__ref.replace('ProjectType:', '') as string,
                    ...getAuthorDetail(publisher?.member?.__ref.replace('ProjectType:', '') as string),
                }),
            ],
        }
    }
}

async function collectPostInfo(node: HTMLElement | null, cancel: AbortSignal) {
    if (!node) return
    if (cancel?.aborted) return
    const postId = getPostId(node)
    if (!postId) return
    const writers = await getPostWriters(postId)
    return { postId, writers }
}

async function registerPostCollectorInner(
    postStore: Next.CollectingCapabilities.PostsProvider['posts'],
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
                                avatarURL: new URL(x.avatar),
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

export const PostProviderMirror: Next.CollectingCapabilities.PostsProvider = {
    posts: creator.EmptyPostProviderState(),
    start(cancel) {
        registerPostCollectorInner(this.posts, cancel)
    },
}
