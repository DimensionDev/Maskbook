import { None, Some, type Option } from 'ts-results-es'
import { Flags } from '@masknet/flags'
import type { SiteAdaptorUI } from '@masknet/types'
import { EnhanceableSite } from '@masknet/shared-base'
import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { type TypedMessage, makeTypedMessageText, makeTypedMessageTuple } from '@masknet/typed-message'
import { creator } from '../../../site-adaptor-infra/utils.js'
import { getProfileIdentifierAtFacebook } from '../utils/getProfileIdentifier.js'
import { clickSeeMore } from '../injection/PostInspector.js'
import { facebookShared } from '../shared.js'
import { createRefsForCreatePostContext } from '../../../site-adaptor-infra/utils/create-post-context.js'
import { collectNodeText } from '../../../utils/index.js'
import { startWatch } from '../../../utils/startWatch.js'

const posts = new LiveSelector().querySelectorAll<HTMLDivElement>('[role=article] [id]  span[dir="auto"]')

export const PostProviderFacebook: SiteAdaptorUI.CollectingCapabilities.PostsProvider = {
    posts: creator.EmptyPostProviderState(),
    start(signal) {
        collectPostsFacebookInner(this.posts, signal)
    },
}
function collectPostsFacebookInner(
    store: SiteAdaptorUI.CollectingCapabilities.PostsProvider['posts'],
    signal: AbortSignal,
) {
    startWatch(
        new MutationObserverWatcher(posts).useForeach((node, key, metadata) => {
            clickSeeMore(node)
        }),
        signal,
    )

    startWatch(
        new MutationObserverWatcher(posts).useForeach((node, key, metadata) => {
            const root = new LiveSelector()
                .replace(() => [metadata.realCurrent])
                .closest('[role=article] [id] span[dir="auto"]')

            const rootProxy = DOMProxy({
                afterShadowRootInit: Flags.shadowRootInit,
                beforeShadowRootInit: Flags.shadowRootInit,
            })
            rootProxy.realCurrent = root.evaluate()[0] as HTMLElement

            // ? inject after comments
            const commentsSelector = root
                .clone()
                .querySelectorAll('[role=article] [id] span[dir="auto"]')
                .closest<HTMLElement>(3)

            // ? inject comment text field
            const commentBoxSelector = root
                .clone()
                .querySelectorAll<HTMLFormElement>('[role="article"] [role="presentation"]:not(img)')
                .map((x) => x.parentElement)

            const { subscriptions, ...info } = createRefsForCreatePostContext()
            const postInfo = facebookShared.utils.createPostContext({
                site: EnhanceableSite.Facebook,
                rootElement: rootProxy,
                suggestedInjectionPoint: metadata.realCurrent!,
                signal,
                comments: { commentBoxSelector, commentsSelector },
                ...subscriptions,
            })

            store.set(metadata, postInfo)
            function collectPostInfo() {
                rootProxy.realCurrent = root.evaluate()[0] as HTMLElement
                const nextTypedMessage: TypedMessage[] = []
                info.postBy.value = getPostBy(metadata, postInfo.hasMaskPayload.getCurrentValue())?.identifier || null
                info.postID.value = getPostID(metadata, rootProxy.realCurrent)
                // parse text
                const text = collectNodeText(node, {
                    onHTMLAnchorElement(node: HTMLAnchorElement): Option<string> {
                        const href = node.getAttribute('href')
                        if (!href) {
                            return None
                        }
                        return Some(
                            '\n' +
                                (href.includes('l.facebook.com') ?
                                    new URL(href).searchParams.get('u')
                                :   node.innerText),
                        )
                    },
                })
                nextTypedMessage.push(makeTypedMessageText(text))
                // parse image
                const images = getMetadataImages(metadata)
                for (const url of images) {
                    info.postMetadataImages.add(url)
                }
                info.postMessage.value = makeTypedMessageTuple(nextTypedMessage)
            }

            function collectLinks() {
                if (metadata.destroyed) return
                const linkElements = metadata.current.querySelectorAll<HTMLLinkElement>('[role=article] [id] a')
                const links = [...Array.from(linkElements).filter((x) => x.href)]

                const seen = new Set<string>()
                for (const x of links) {
                    if (seen.has(x.href)) continue
                    seen.add(x.href)
                    info.postMetadataMentionedLinks.set(x, x.href)
                }
            }

            function run() {
                collectPostInfo()
                collectLinks()
            }

            run()
            return {
                onNodeMutation: run,
                onTargetChanged: run,
                onRemove: () => store.delete(metadata),
            }
        }),
        signal,
    )
}

function getPostBy(node: DOMProxy, allowCollectInfo: boolean) {
    if (node.destroyed) return
    const dom = [(node.current.closest('[role="article"]') ?? node.current.parentElement)!.querySelectorAll('a')[1]]
    // side effect: save to service
    return getProfileIdentifierAtFacebook(Array.from(dom), allowCollectInfo)
}

function getPostID(node: DOMProxy, root: HTMLElement): null | string {
    if (node.destroyed) return null
    // In single url
    // cspell:disable-next-line
    if (location.href.match(/plugins.+(perma.+story_fbid%3D|posts%2F)?/)) {
        const url = new URL(location.href)
        return url.searchParams.get('id')
    } else {
        try {
            // In timeline
            const postTimeNode1 = root.closest('[role=article]')?.querySelector('[href*="permalink"]')
            const postIdMode1 =
                postTimeNode1 ?
                    postTimeNode1
                        .getAttribute('href')
                        ?.match(/story_fbid=(\d+)/g)?.[0]
                        .split('=')[1] ?? null
                :   null

            if (postIdMode1) return postIdMode1

            const postTimeNode2 = root.closest('[role=article]')?.querySelector('[href*="posts"]')
            const postIdMode2 =
                postTimeNode2 ?
                    postTimeNode2
                        .getAttribute('href')
                        ?.match(/posts\/(\w+)/g)?.[0]
                        .split('/')[1] ?? null
                :   null
            if (postIdMode2 && /^-?\w+$/.test(postIdMode2)) return postIdMode2
        } catch {
            return null
        }

        const parent = node.current.parentElement
        if (!parent) return null
        const idNode = Array.from(parent.querySelectorAll('[id]'))
            .map((x) => x.id.split(';'))
            .filter((x) => x.length > 1)
        if (!idNode.length) return null
        return idNode[0][2]
    }
}

function getMetadataImages(node: DOMProxy): string[] {
    if (node.destroyed) return []
    const parent = node.current.parentElement?.parentElement?.parentElement?.parentElement?.parentElement
    if (!parent) return []
    const imgNodes = parent.querySelectorAll('img') || []
    if (!imgNodes.length) return []
    const imgUrls = Array.from(imgNodes, (node) => node.src).filter(Boolean)
    if (!imgUrls.length) return []
    return imgUrls
}
