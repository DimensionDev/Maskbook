import { postsContentSelector } from '../utils/selector'
import { MutationObserverWatcher, ValueRef } from '@dimensiondev/holoflows-kit'
import type { SocialNetworkUI } from '../../../social-network'
import { creator, SocialNetworkUI as Next } from '../../../social-network'
import { PostInfo } from '../../../social-network/PostInfo'
import { deconstructPayload, Payload } from '../../../utils/type-transform/Payload'
import { postIdParser } from '../utils/fetch'
import { memoize } from 'lodash-es'
import Services from '../../../extension/service'
import { injectMaskIconToPostTwitter } from '../injection/MaskbookIcon'
import { startWatch } from '../../../utils/watcher'
import { postsImageSelector } from '../utils/selector'
import { ProfileIdentifier } from '../../../database/type'
import { postParser, postImagesParser } from '../utils/fetch'
import { untilElementAvailable } from '../../../utils/dom'
import {
    makeTypedMessageImage,
    makeTypedMessageFromList,
    makeTypedMessageEmpty,
    makeTypedMessageSuspended,
    makeTypedMessageCompound,
    extractTextFromTypedMessage,
} from '../../../protocols/typed-message'
import { twitterShared } from '../shared'
import type { Result } from 'ts-results'
import { twitterBase } from '../base'
import { twitterEncoding } from '../encoding'

function registerPostCollectorInner(
    postStore: Next.CollectingCapabilities.PostsProvider['posts'],
    cancel: AbortSignal,
) {
    const getTweetNode = (node: HTMLElement) => {
        return node.closest<HTMLDivElement>(
            [
                '.tweet',
                '.main-tweet',
                'article > div',
                'div[role="link"]', // retweet in new twitter
            ].join(),
        )
    }
    const updateProfileInfo = memoize(
        (info: PostInfo) => {
            Services.Identity.updateProfileInfo(info.postBy.value, {
                nickname: info.nickname.value,
                avatarURL: info.avatarURL.value,
            })
        },
        (info: PostInfo) => info.postBy.value?.toText(),
    )
    const watcher = new MutationObserverWatcher(postsContentSelector())
        .useForeach((node, _, proxy) => {
            const tweetNode = getTweetNode(node)
            if (!tweetNode) return
            const info: PostInfo = new (class extends PostInfo {
                get rootNode() {
                    return proxy.current
                }
                rootNodeProxy = proxy
                commentsSelector = undefined
                commentBoxSelector = undefined
                postContentNode = undefined
            })()
            function run() {
                collectPostInfo(tweetNode, info, cancel)
                collectLinks(tweetNode, info, cancel)
            }
            run()
            const undo = info.postPayload.addListener((payload) => {
                if (!payload) return
                if (payload.err && info.postMetadataImages.size === 0) return
                updateProfileInfo(info)
            })
            cancel.addEventListener('abort', undo)
            non_overlapping_assign(
                info.postPayload,
                deconstructPayload(info.postContent.value, twitterEncoding.payloadDecoder),
            )
            const undo2 = info.postContent.addListener((newValue) => {
                non_overlapping_assign(info.postPayload, deconstructPayload(newValue, twitterEncoding.payloadDecoder))
            })
            cancel.addEventListener('abort', undo2)
            injectMaskIconToPostTwitter(info, cancel)
            postStore.set(proxy, info)
            return {
                onTargetChanged: run,
                onRemove: () => postStore.delete(proxy),
                onNodeMutation: run,
            }
        })
        .assignKeys((node) => {
            const tweetNode = getTweetNode(node)
            const isQuotedTweet = tweetNode?.getAttribute('role') === 'link'
            return tweetNode
                ? `${isQuotedTweet ? 'QUOTED' : ''}${postIdParser(tweetNode)}${node.innerText.replace(/\s/gm, '')}`
                : node.innerText
        })
    startWatch(watcher, cancel)
}

export const PostProviderTwitter: Next.CollectingCapabilities.PostsProvider = {
    posts: creator.PostProviderStore(),
    start(cancel) {
        registerPostCollectorInner(this.posts, cancel)
    },
}

function collectPostInfo(tweetNode: HTMLDivElement | null, info: PostInfo, cancel: AbortSignal) {
    if (!tweetNode) return
    if (cancel?.aborted) return
    const { pid, messages, handle, name, avatar } = postParser(tweetNode)

    if (!pid) return
    const postBy = new ProfileIdentifier(twitterBase.networkIdentifier, handle)
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
    const images = untilElementAvailable(postsImageSelector(tweetNode), 10000)
        .then(() => postImagesParser(tweetNode))
        .then((urls) => {
            for (const url of urls) info.postMetadataImages.add(url)
            if (urls.length) return makeTypedMessageFromList(...urls.map((x) => makeTypedMessageImage(x)))
            return makeTypedMessageEmpty()
        })
        .catch(() => makeTypedMessageEmpty())

    info.postMessage.value = makeTypedMessageCompound([...messages, makeTypedMessageSuspended(images)])
}

function collectLinks(tweetNode: HTMLDivElement | null, info: PostInfo, cancel: AbortSignal) {
    if (!tweetNode) return
    if (cancel?.aborted) return
    const links = [...tweetNode.querySelectorAll('a')].filter((x) => x.rel)
    const seen = new Set<string>(['https://help.twitter.com/using-twitter/how-to-tweet#source-labels'])
    for (const x of links) {
        if (seen.has(x.href)) continue
        seen.add(x.href)
        info.postMetadataMentionedLinks.set(x, x.href)
        Services.Helper.resolveTCOLink(x.href).then((val) => {
            if (cancel?.aborted) return
            if (!val) return
            info.postMetadataMentionedLinks.set(x, val)
            const tryDecode = deconstructPayload(val, twitterEncoding.payloadDecoder)
            non_overlapping_assign(info.postPayload, tryDecode)
        })
    }
}
function non_overlapping_assign(post: ValueRef<Result<Payload, Error>>, next: Result<Payload, Error>) {
    if (post.value.ok && next.err) return // don't flush successful parse
    post.value = next
}
