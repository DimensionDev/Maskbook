import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import {
    makeTypedMessageEmpty,
    makeTypedMessagePromise,
    makeTypedMessageTuple,
    makeTypedMessageTupleFromList,
    ProfileIdentifier,
} from '@dimensiondev/maskbook-shared'
import { extractTextFromTypedMessage, makeTypedMessageImage } from '../../../protocols/typed-message'
import { PostInfo } from '../../../social-network/PostInfo'
import type { SocialNetworkUI as Next } from '../../../social-network/types'
import { creator } from '../../../social-network/utils'
import { untilElementAvailable } from '../../../utils/dom'
import { deconstructPayload } from '../../../utils/type-transform/Payload'
import { startWatch } from '../../../utils/watcher'
import { mindsBase } from '../base'
import { mindsShared } from '../shared'
import { postParser } from '../utils/fetch'
import { postContentSelector } from '../utils/selector'

export const PostProviderMinds: Next.CollectingCapabilities.PostsProvider = {
    posts: creator.PostProviderStore(),
    start(signal) {
        collectPostsMindsInner(this.posts, signal)
    },
}

abstract class MindsPostInfo extends PostInfo {
    parsePayload(x: string) {
        return deconstructPayload(x)
    }
}

function collectPostsMindsInner(store: Next.CollectingCapabilities.PostsProvider['posts'], signal: AbortSignal) {
    startWatch(
        new MutationObserverWatcher(postContentSelector()).useForeach((node, key, metadata) => {
            const activitySelector = new LiveSelector()
                .replace(() => [metadata.realCurrent])
                .closest('m-activity, m-activity__modal')
            const activityNode = activitySelector.evaluate()[0]! as HTMLElement

            // ? inject after comments
            const commentSelector = activitySelector
                .clone()
                .querySelectorAll<HTMLElement>('m-comment .m-comment__message')

            // ? inject comment text field
            const commentBoxSelector = activitySelector
                .clone()
                .querySelectorAll<HTMLFormElement>('.m-commentPoster__form')
                .map((x) => x.parentElement)

            const info: PostInfo = new (class extends MindsPostInfo {
                commentsSelector = commentSelector
                commentBoxSelector = commentBoxSelector
                rootNodeProxy = metadata
                postContentNode = node

                get rootNode() {
                    return activityNode
                }
            })()

            store.set(metadata, info)

            function collectPostInfo() {
                const { pid, messages, handle, name, avatar } = postParser(activityNode)
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

                // decode steganographic image
                // don't add await on this
                const images = untilElementAvailable(
                    new LiveSelector([activityNode]).querySelectorAll<HTMLImageElement>(
                        '.m-activityContent__media--image img',
                    ),
                    10000,
                )
                    .then(() => getMetadataImages(activityNode))
                    .then((urls) => {
                        for (const url of urls) info.postMetadataImages.add(url)
                        if (urls.length)
                            return makeTypedMessageTupleFromList(...urls.map((x) => makeTypedMessageImage(x)))
                        return makeTypedMessageEmpty()
                    })
                    .catch(() => makeTypedMessageEmpty())

                info.postMessage.value = makeTypedMessageTuple([...messages, makeTypedMessagePromise(images)])
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

function getMetadataImages(activityNode: HTMLElement): string[] {
    const imgNodes = activityNode.querySelectorAll<HTMLImageElement>('.m-activityContent__media--image img') || []

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
