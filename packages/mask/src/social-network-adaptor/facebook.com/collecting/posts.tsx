import type { SocialNetworkUI as Next } from '@masknet/types'
import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { creator } from '../../../social-network/utils.js'
import { isMobileFacebook } from '../utils/isMobile.js'
import { getProfileIdentifierAtFacebook } from '../utils/getProfileIdentifier.js'
import { TypedMessage, makeTypedMessageText, makeTypedMessageImage } from '@masknet/typed-message'
import { clickSeeMore } from '../injection/PostInspector.js'
import { startWatch } from '../../../utils/watcher.js'
import { facebookShared } from '../shared.js'
import { createRefsForCreatePostContext } from '../../../social-network/utils/create-post-context.js'
import { collectNodeText } from '../../../utils/index.js'
import { None, Some, Option } from 'ts-results-es'

const posts = new LiveSelector().querySelectorAll<HTMLDivElement>(
    isMobileFacebook ? '.story_body_container > div' : '[role=article]  [id]  span[dir="auto"]',
)

export const PostProviderFacebook: Next.CollectingCapabilities.PostsProvider = {
    posts: creator.EmptyPostProviderState(),
    start(signal) {
        collectPostsFacebookInner(this.posts, signal)
    },
}
function collectPostsFacebookInner(store: Next.CollectingCapabilities.PostsProvider['posts'], signal: AbortSignal) {
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
                afterShadowRootInit: { mode: process.env.shadowRootMode },
                beforeShadowRootInit: { mode: process.env.shadowRootMode },
            })
            rootProxy.realCurrent = root.evaluate()[0] as HTMLElement

            // ? inject after comments
            const commentSelectorPC = root
                .clone()
                .querySelectorAll('[role=article] [id] span[dir="auto"]')
                .closest<HTMLElement>(3)
            const commentSelectorMobile = root
                .clone()
                .map((x) => x.parentElement)
                .querySelectorAll<HTMLElement>('[data-commentid]')

            const commentsSelector = isMobileFacebook ? commentSelectorMobile : commentSelectorPC

            // ? inject comment text field
            const commentBoxSelectorPC = root
                .clone()
                .querySelectorAll<HTMLFormElement>('[role="article"] [role="presentation"]:not(img)')
                .map((x) => x.parentElement)

            const commentBoxSelectorMobile = root
                .clone()
                .map((x) => x.parentElement)
                .querySelectorAll('textarea')
                .map((x) => x.parentElement)
                .filter((x) => x.innerHTML.includes('comment'))

            const commentBoxSelector = isMobileFacebook ? commentBoxSelectorMobile : commentBoxSelectorPC

            const { subscriptions, ...info } = createRefsForCreatePostContext()
            const postInfo = facebookShared.utils.createPostContext({
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
                                (href.includes('l.facebook.com')
                                    ? new URL(href).searchParams.get('u')
                                    : node.innerText),
                        )
                    },
                })
                nextTypedMessage.push(makeTypedMessageText(text))
                // parse image
                const images = getMetadataImages(metadata)
                for (const url of images) {
                    info.postMetadataImages.add(url)
                    nextTypedMessage.push(makeTypedMessageImage(url))
                }
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

function getPostBy(node: DOMProxy, allowCollectInfo: boolean) {
    if (node.destroyed) return
    const dom = isMobileFacebook
        ? node.current.querySelectorAll('a')
        : [(node.current.closest('[role="article"]') ?? node.current.parentElement)!.querySelectorAll('a')[1]]
    // side effect: save to service
    return getProfileIdentifierAtFacebook(Array.from(dom), allowCollectInfo)
}

function getPostID(node: DOMProxy, root: HTMLElement): null | string {
    if (node.destroyed) return null
    if (isMobileFacebook) {
        const abbr = node.current.querySelector('abbr')
        if (!abbr) return null
        const idElement = abbr.closest('a')
        if (!idElement) return null
        const id = new URL(idElement.href)
        return id.searchParams.get('id') || ''
    } else {
        // In single url
        if (location.href.match(/plugins.+(perma.+story_fbid%3D|posts%2F)?/)) {
            const url = new URL(location.href)
            return url.searchParams.get('id')
        } else {
            try {
                // In timeline
                const postTimeNode1 = root.closest('[role=article]')?.querySelector('[href*="permalink"]')
                const postIdMode1 = postTimeNode1
                    ? postTimeNode1
                          .getAttribute('href')
                          ?.match(/story_fbid=(\d+)/g)?.[0]
                          .split('=')[1] ?? null
                    : null

                if (postIdMode1) return postIdMode1

                const postTimeNode2 = root.closest('[role=article]')?.querySelector('[href*="posts"]')
                const postIdMode2 = postTimeNode2
                    ? postTimeNode2
                          .getAttribute('href')
                          ?.match(/posts\/(\w+)/g)?.[0]
                          .split('/')[1] ?? null
                    : null
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
}

function getMetadataImages(node: DOMProxy): string[] {
    if (node.destroyed) return []
    const parent = node.current.parentElement?.parentElement?.parentElement?.parentElement
    if (!parent) return []
    const imgNodes = isMobileFacebook
        ? parent.querySelectorAll<HTMLImageElement>('div>div>div>a>div>div>i.img')
        : parent.querySelectorAll('img') || []
    if (!imgNodes.length) return []
    const imgUrls = isMobileFacebook
        ? (getComputedStyle(imgNodes[0]).backgroundImage || '')
              .slice(4, -1)
              .replace(/["']/g, '')
              .split(',')
              .filter(Boolean)
        : Array.from(imgNodes, (node) => node.src).filter(Boolean)
    if (!imgUrls.length) return []
    return imgUrls
}
