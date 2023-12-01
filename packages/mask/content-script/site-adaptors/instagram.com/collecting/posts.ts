import { type DOMProxy, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { type TypedMessage, makeTypedMessageImage, makeTypedMessageTuple } from '@masknet/typed-message'
import { EnhanceableSite, ProfileIdentifier } from '@masknet/shared-base'
import type { SiteAdaptorUI } from '@masknet/types'
import { startWatch } from '../../../utils/startWatch.js'
import { creator } from '../../../site-adaptor-infra/utils.js'
import { instagramBase } from '../base.js'
import { createRefsForCreatePostContext } from '../../../site-adaptor-infra/utils/create-post-context.js'
import { instagramShared } from '../shared.js'

const posts = new LiveSelector().querySelectorAll<HTMLDivElement>(
    'main[role="main"] article[role="presentation"][tabindex="-1"]',
)

export const PostProviderInstagram: SiteAdaptorUI.CollectingCapabilities.PostsProvider = {
    posts: creator.EmptyPostProviderState(),
    start(signal) {
        collectPostsInstagramInner(this.posts, signal)
    },
}
function collectPostsInstagramInner(
    store: SiteAdaptorUI.CollectingCapabilities.PostsProvider['posts'],
    signal: AbortSignal,
) {
    startWatch(
        new MutationObserverWatcher(posts).useForeach((node, key, metadata) => {
            const { subscriptions, ...info } = createRefsForCreatePostContext()
            const postInfo = instagramShared.utils.createPostContext({
                site: EnhanceableSite.Instagram,
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

function getPostBy(node: DOMProxy): ProfileIdentifier | null {
    if (node.destroyed) return null
    // the first a
    const author = node.current.querySelector('a')
    if (!author) return null
    const href = new URL(author.href).pathname
    if (href.startsWith('/') && href.endsWith('/') && href.slice(1, -1).includes('/') === false) {
        return ProfileIdentifier.of(instagramBase.networkIdentifier, href.slice(1, -1)).unwrapOr(null)
    }
    return null
}
function getPostID(node: DOMProxy): null | string {
    if (node.destroyed) return null
    return node.current?.querySelector<HTMLAnchorElement>('span a[href^="/"]')?.text || null
}
