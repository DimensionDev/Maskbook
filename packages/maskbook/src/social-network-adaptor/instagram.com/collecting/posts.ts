import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import type { SocialNetworkUI } from '../../../social-network/types'
import { creator } from '../../../social-network/utils'
import { TypedMessage, makeTypedMessageImage, makeTypedMessageTuple } from '../../../protocols/typed-message'
import { startWatch } from '../../../utils/watcher'
import { ProfileIdentifier } from '@masknet/shared'
import { instagramBase } from '../base'
import { createRefsForCreatePostContext } from '../../../social-network/utils/create-post-context'
import { instagramShared } from '../shared'

const posts = new LiveSelector().querySelectorAll<HTMLDivElement>(
    'main[role="main"] article[role="presentation"][tabindex="-1"]',
)

export const PostProviderInstagram: SocialNetworkUI.CollectingCapabilities.PostsProvider = {
    posts: creator.EmptyPostProviderState(),
    start(signal) {
        collectPostsInstagramInner(this.posts, signal)
    },
}
function collectPostsInstagramInner(
    store: SocialNetworkUI.CollectingCapabilities.PostsProvider['posts'],
    signal: AbortSignal,
) {
    startWatch(
        new MutationObserverWatcher(posts).useForeach((node, key, metadata) => {
            const { subscriptions, ...info } = createRefsForCreatePostContext()
            const postInfo = instagramShared.utils.createPostContext({
                comments: undefined,
                rootElement: metadata,
                suggestedInjectionPoint:
                    metadata.realCurrent!.querySelector<HTMLDivElement>('header+div+div') || metadata.realCurrent!,
                ...subscriptions,
            })

            store.set(metadata, postInfo)
            function collectPostInfo() {
                const nextTypedMessage: TypedMessage[] = []
                info.postBy.value = getPostBy(metadata)
                info.postID.value = getPostID(metadata)
                const img = node.querySelectorAll('img')[1]
                if (img) {
                    nextTypedMessage.push(makeTypedMessageImage(img.src, img))
                    info.postMetadataImages.add(img.src)
                } else nextTypedMessage.push(makeTypedMessageImage(''))
                info.postMessage.value = makeTypedMessageTuple(nextTypedMessage)
            }
            collectPostInfo()
            return {
                onNodeMutation: collectPostInfo,
                onTargetChanged: collectPostInfo,
                onRemove: () => store.delete(metadata),
            }
        }),
        signal,
    )
}

function getPostBy(node: DOMProxy): ProfileIdentifier {
    // the first a
    const author = node.current.querySelector('a')
    if (!author) return ProfileIdentifier.unknown
    const href = new URL(author.href).pathname
    if (href.startsWith('/') && href.endsWith('/') && href.slice(1, -1).includes('/') === false) {
        return new ProfileIdentifier(instagramBase.networkIdentifier, href.slice(1, -1))
    }
    return ProfileIdentifier.unknown
}
function getPostID(node: DOMProxy): null | string {
    return node.current?.querySelector<HTMLAnchorElement>('a[href^="/p/"]')?.href.match(/\/p\/(.+)\/.+/)?.[1] || null
}
