import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { SocialNetworkUI as Next, CREATOR } from '@masknet/types'
import {
    makeTypedMessageEmpty,
    makeTypedMessagePromise,
    makeTypedMessageTuple,
    makeTypedMessageTupleFromList,
    makeTypedMessageImage,
} from '@masknet/typed-message'
import { ProfileIdentifier } from '@masknet/shared-base'
import { createRefsForCreatePostContext } from '../../../social-network/utils/create-post-context.js'
import { untilElementAvailable } from '../../../utils/dom.js'
import { startWatch } from '../../../utils/watcher.js'
import { mindsBase } from '../base.js'
import { mindsShared } from '../shared.js'
import { postParser } from '../utils/fetch.js'
import { postContentSelector } from '../utils/selector.js'
import { getCurrentIdentifier } from '../../utils.js'
import Services from '../../../extension/service.js'

export const PostProviderMinds: Next.CollectingCapabilities.PostsProvider = {
    posts: CREATOR.EmptyPostProviderState(),
    start(signal) {
        collectPostsMindsInner(this.posts, signal)
    },
}

function collectPostsMindsInner(store: Next.CollectingCapabilities.PostsProvider['posts'], signal: AbortSignal) {
    startWatch(
        new MutationObserverWatcher(postContentSelector()).useForeach((node, key, metadata) => {
            const activitySelector = new LiveSelector()
                .replace(() => [metadata.realCurrent])
                .closest('m-activityv2, m-activity__modal')
            const activityNode = activitySelector.evaluate()[0]! as HTMLElement

            // ? inject after comments
            const commentsSelector = activitySelector
                .clone()
                .querySelectorAll<HTMLElement>('m-activityv2__content .m-comment__message')

            // ? inject comment text field
            const commentBoxSelector = activitySelector
                .clone()
                .querySelectorAll<HTMLFormElement>('.m-commentPoster__form')
                .map((x) => x.parentElement)

            const { subscriptions, ...info } = createRefsForCreatePostContext()
            const postInfo = mindsShared.utils.createPostContext({
                comments: { commentBoxSelector, commentsSelector },
                rootElement: metadata,
                suggestedInjectionPoint: node,
                ...subscriptions,
            })

            store.set(metadata, postInfo)

            function collectPostInfo() {
                const { pid, messages, handle, name, avatar } = postParser(activityNode)
                if (!pid) return
                const postBy = ProfileIdentifier.of(mindsBase.networkIdentifier, handle).unwrapOr(null)
                info.postID.value = pid
                info.postBy.value = postBy
                info.nickname.value = name
                info.avatarURL.value = avatar || null

                if (name && postBy) {
                    const currentProfile = getCurrentIdentifier()

                    Services.Identity.updateProfileInfo(postBy, {
                        nickname: name,
                        avatarURL: avatar,
                    })
                    if (currentProfile?.linkedPersona)
                        Services.Identity.createNewRelation(postBy, currentProfile.linkedPersona)
                }
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
