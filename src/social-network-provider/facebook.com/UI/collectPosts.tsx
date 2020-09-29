import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { deconstructPayload } from '../../../utils/type-transform/Payload'
import type { SocialNetworkUI } from '../../../social-network/ui'
import { PostInfo } from '../../../social-network/PostInfo'
import { isMobileFacebook } from '../isMobile'
import { getProfileIdentifierAtFacebook } from '../getPersonIdentifierAtFacebook'
import {
    TypedMessage,
    makeTypedMessageText,
    makeTypedMessageImage,
    makeTypedMessageCompound,
} from '../../../protocols/typed-message'
import { Flags } from '../../../utils/flags'
import { clickSeeMore } from './injectPostInspector'

const posts = new LiveSelector().querySelectorAll<HTMLDivElement>(
    isMobileFacebook ? '.story_body_container ' : '[data-testid] [role=article] [data-ad-preview="message"]',
)

export function collectPostsFacebook(this: SocialNetworkUI) {
    new MutationObserverWatcher(posts)
        .useForeach((node, key, metadata) => {
            clickSeeMore(node)
        })
        .setDOMProxyOption({ afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode } })
        .startWatch({
            childList: true,
            subtree: true,
        })

    new MutationObserverWatcher(posts)
        .useForeach((node, key, metadata) => {
            const root = new LiveSelector()
                .replace(() => [metadata.realCurrent])
                .closest('[role=article]')
                .map((x) => x.parentElement?.parentElement?.parentElement)

            // ? inject after comments
            const commentSelectorPC = root
                .clone()
                .querySelectorAll('[role=article] span[dir="auto"] div[dir="auto"]')
                .closest<HTMLElement>(2)
            const commentSelectorMobile = root
                .clone()
                .map((x) => x.parentElement)
                .querySelectorAll<HTMLElement>('[data-commentid]')

            const commentSelector = isMobileFacebook ? commentSelectorMobile : commentSelectorPC

            // ? inject comment text field
            const commentBoxSelectorPC = root.clone().querySelectorAll<HTMLFormElement>('form form')

            const commentBoxSelectorMobile = root
                .clone()
                .map((x) => x.parentElement)
                .querySelectorAll('textarea')
                .map((x) => x.parentElement)
                .filter((x) => x.innerHTML.indexOf('comment') !== -1)

            const commentBoxSelector = isMobileFacebook ? commentBoxSelectorMobile : commentBoxSelectorPC

            const info: PostInfo = new (class extends PostInfo {
                commentsSelector = commentSelector
                commentBoxSelector = commentBoxSelector
                get rootNode() {
                    return root.evaluate()[0]! as HTMLElement
                }
                rootNodeProxy = metadata
                postContentNode = metadata.realCurrent!
            })()

            this.posts.set(metadata, info)
            function collectPostInfo() {
                const nextTypedMessage: TypedMessage[] = []
                info.postBy.value = getPostBy(metadata, info.postPayload.value !== null).identifier
                info.postID.value = getPostID(metadata)
                // parse text
                const text = collectNodeText(node)
                nextTypedMessage.push(makeTypedMessageText(text))
                info.postContent.value = text
                // parse image
                const images = getMetadataImages(metadata)
                for (const url of images) {
                    info.postMetadataImages.add(url)
                    nextTypedMessage.push(makeTypedMessageImage(url))
                }
                // parse post content
                info.postMessage.value = makeTypedMessageCompound(nextTypedMessage)
            }
            collectPostInfo()
            info.postPayload.value = deconstructPayload(info.postContent.value, this.payloadDecoder)
            info.postContent.addListener((newVal) => {
                info.postPayload.value = deconstructPayload(newVal, this.payloadDecoder)
            })
            return {
                onNodeMutation: collectPostInfo,
                onTargetChanged: collectPostInfo,
                onRemove: () => this.posts.delete(metadata),
            }
        })
        .setDOMProxyOption({ afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode } })
        .startWatch({
            childList: true,
            subtree: true,
        })
}

export function collectNodeText(node: HTMLElement | undefined): string {
    if (!node) return ''
    if (!node.querySelector('a,img')) return node.innerText
    return [...node.childNodes]
        .map((each) => {
            if (each.nodeType === document.TEXT_NODE) return (each as Text).nodeValue || ''
            if (each instanceof HTMLAnchorElement) {
                const href = each.getAttribute('href')
                if (!href) return each.innerText
                return '\n' + href.includes('l.facebook.com') ? new URL(href).searchParams.get('u') : each.innerText
            }
            if (each instanceof HTMLImageElement) return each.alt
            if (each instanceof HTMLElement) return collectNodeText(each)
            return ''
        })
        .join('')
}

function getPostBy(node: DOMProxy, allowCollectInfo: boolean) {
    const dom = isMobileFacebook
        ? node.current.querySelectorAll('a')
        : [(node.current.closest('[role="article"]') ?? node.current.parentElement)!.querySelectorAll('a')[1]]
    // side effect: save to service
    return getProfileIdentifierAtFacebook(Array.from(dom), allowCollectInfo)
}
function getPostID(node: DOMProxy): null | string {
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
    const parent = node.current.parentElement

    if (!parent) return []
    const imgNodes = isMobileFacebook
        ? parent.querySelectorAll<HTMLImageElement>('div>div>div>a>div>div>i.img')
        : parent.nextElementSibling?.querySelectorAll('img') || []
    if (!imgNodes.length) return []
    const imgUrls = isMobileFacebook
        ? (getComputedStyle(imgNodes[0]).backgroundImage || '')
              .slice(4, -1)
              .replace(/['"]/g, '')
              .split(',')
              .filter(Boolean)
        : Array.from(imgNodes)
              .map((node) => node.src)
              .filter(Boolean)
    if (!imgUrls.length) return []
    return imgUrls
}
