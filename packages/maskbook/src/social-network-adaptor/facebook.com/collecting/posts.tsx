import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import type { SocialNetworkUI as Next } from '../../../social-network/types'
import { creator } from '../../../social-network/utils'
import { isMobileFacebook } from '../utils/isMobile'
import { getProfileIdentifierAtFacebook } from '../utils/getProfileIdentifier'
import {
    TypedMessage,
    makeTypedMessageText,
    makeTypedMessageImage,
    makeTypedMessageTuple,
} from '../../../protocols/typed-message'
import { clickSeeMore } from '../injection/PostInspector'
import { startWatch } from '../../../utils/watcher'
import { facebookShared } from '../shared'
import { createRefsForCreatePostContext } from '../../../social-network/utils/create-post-context'
import { Flags } from '../../../utils'
import { collectNodeText } from '../../../utils'
import { None, Some, Option } from 'ts-results'

const posts = new LiveSelector().querySelectorAll<HTMLDivElement>(
    isMobileFacebook ? '.story_body_container > div' : '[role=article] [data-ad-preview="message"]',
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
                .closest('[role=article]')
                .map((x) => x.parentElement?.parentElement?.parentElement)
            const rootProxy = DOMProxy({
                afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode },
                beforeShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode },
            })
            rootProxy.realCurrent = root.evaluate()[0]

            // ? inject after comments
            const commentSelectorPC = root
                .clone()
                .querySelectorAll('[role=article] [aria-label] span[dir="auto"]')
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
                rootProxy.realCurrent = root.evaluate()[0]
                const nextTypedMessage: TypedMessage[] = []
                info.postBy.value = getPostBy(metadata, postInfo.postPayload.getCurrentValue() !== null).identifier
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
                // parse post content
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

function getPostBy(node: DOMProxy, allowCollectInfo: boolean) {
    const dom = isMobileFacebook
        ? node.current.querySelectorAll('a')
        : [(node.current.closest('[role="article"]') ?? node.current.parentElement)!.querySelectorAll('a')[1]]
    // side effect: save to service
    return getProfileIdentifierAtFacebook(Array.from(dom), allowCollectInfo)
}

function getPostID(node: DOMProxy, root: HTMLElement): null | string {
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
            // In timeline
            const postTimeNode = root.querySelector('[href*="permalink"]')
            const postIdMode1 = postTimeNode
                ? postTimeNode.getAttribute('href')?.match(/(?<=story_fbid=)(\d+)/g)?.[0] ?? null
                : null
            if (postIdMode1) return postIdMode1

            const postIdMode2 = postTimeNode ? postTimeNode.getAttribute('href')?.split('/').at(-1) ?? null : null
            if (postIdMode2 && /^-?\d+$/.test(postIdMode2)) return postIdMode2

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
    const parent = node.current.parentElement?.parentElement

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
        : Array.from(imgNodes)
              .map((node) => node.src)
              .filter(Boolean)
    if (!imgUrls.length) return []
    return imgUrls
}
