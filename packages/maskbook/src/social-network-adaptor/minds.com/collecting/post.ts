import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { ProfileIdentifier } from '@dimensiondev/maskbook-shared'
import {
    extractTextFromTypedMessage,
    makeTypedMessageCompound,
    makeTypedMessageImage,
    TypedMessage,
} from '../../../protocols/typed-message'
import { PostInfo } from '../../../social-network/PostInfo'
import type { SocialNetworkUI as Next } from '../../../social-network/types'
import { creator } from '../../../social-network/utils'
import { deconstructPayload } from '../../../utils/type-transform/Payload'
import { startWatch } from '../../../utils/watcher'
import { mindsBase } from '../base'
import { mindsShared } from '../shared'
import { postParser } from '../utils/fetch'

const posts = new LiveSelector().querySelectorAll<HTMLDivElement>('m-activity, m-activity__modal')

export const PostProviderMinds: Next.CollectingCapabilities.PostsProvider = {
    posts: creator.PostProviderStore(),
    start(signal) {
        collectPostsMindsInner(this.posts, signal)
    },
}

function collectPostsMindsInner(store: Next.CollectingCapabilities.PostsProvider['posts'], signal: AbortSignal) {
    startWatch(
        new MutationObserverWatcher(posts).useForeach((node, key, metadata) => {
            const root = new LiveSelector().replace(() => [metadata.realCurrent]).closest('m-activity')

            const messageWrapper = metadata.current.querySelector<HTMLDivElement>('m-activity__content .m-activityContent__messageWrapper')
            const isImage = metadata.current.querySelector<HTMLDivElement>('m-activity__content .m-activityContent__media--image')
            const descriptionWrapper = metadata.current.querySelector<HTMLDivElement>('m-activity__content .m-activityContent__mediaDescription .m-activityContent__descriptionWrapper')
            const postContentNode = metadata.current.querySelector<HTMLDivElement>('m-activity__content')

            // ? inject after comments
            const commentSelector = root.clone().querySelectorAll<HTMLElement>('m-comment .m-comment__message')

            // ? inject comment text field
            const commentBoxSelector = root
                .clone()
                .querySelectorAll<HTMLFormElement>('.m-commentPoster__form')
                .map((x) => x.parentElement)

            const info: PostInfo = new (class extends PostInfo {
                commentsSelector = commentSelector
                commentBoxSelector = commentBoxSelector
                rootNodeProxy = metadata
                postContentNode = (isImage ? descriptionWrapper : messageWrapper) || postContentNode!

                get rootNode() {
                    return root.evaluate()[0]! as HTMLElement
                }
            })()

            store.set(metadata, info)

            function collectPostInfo() {
                const nextTypedMessage: TypedMessage[] = []

                const { pid, messages, handle, name, avatar } = postParser(metadata.current)
                if (!pid) return
                const postBy = handle
                    ? new ProfileIdentifier(mindsBase.networkIdentifier, handle)
                    : ProfileIdentifier.unknown
                info.postID.value = pid
                info.postContent.value = messages
                    .map((x) => {
                        const extracted = extractTextFromTypedMessage(x)
                        return extracted.ok ? extracted.val : ''
                    })
                    // add space between anchor and plain text
                    .join(' ')
                if (!info.postBy.value.equals(postBy)) info.postBy.value = postBy
                info.nickname.value = name
                info.avatarURL.value = avatar || null

                nextTypedMessage.push(...messages)

                const images = getMetadataImages(metadata)
                for (const url of images) {
                    info.postMetadataImages.add(url)
                    nextTypedMessage.push(makeTypedMessageImage(url))
                }

                info.postMessage.value = makeTypedMessageCompound(nextTypedMessage)
            }

            collectPostInfo()
            info.postPayload.value = deconstructPayload(
                info.postContent.value,
                mindsShared.utils.textPayloadPostProcessor?.decoder,
            )
            info.postContent.addListener((newVal) => {
                info.postPayload.value = deconstructPayload(newVal, mindsShared.utils.textPayloadPostProcessor?.decoder)
            })
            return {
                onNodeMutation: collectPostInfo,
                onTargetChanged: collectPostInfo,
                onRemove: () => store.delete(metadata),
            }
        }),
        signal,
    )
}

function getMetadataImages(node: DOMProxy): string[] {
    const parent = node.current.parentElement

    if (!parent) return []
    const imgNodes = parent?.querySelectorAll<HTMLImageElement>('.m-activityContent__media--image img') || []

    if (!imgNodes.length) return []
    const imgUrls = Array.from(imgNodes)
        .map((node) => node.src)
        // FIXME! there's a CORS issue on the CDN
        .map((src) => src.replace('cdn.minds.com', 'minds.com'))
        // Use the master version of the image so the dimensions don't change
        .map((src) => src.replace('xlarge', 'master'))
        .filter(Boolean)
    if (!imgUrls.length) return []
    return imgUrls
}
