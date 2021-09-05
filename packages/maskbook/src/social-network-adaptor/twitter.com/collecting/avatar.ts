import { IntervalWatcher } from '@dimensiondev/holoflows-kit'
import {
    activatedSocialNetworkUI,
    createorAvatar,
    globalUIState,
    SocialNetworkUI as Next,
} from '../../../social-network'
import type { PostInfo } from '../../../social-network/PostInfo'
import { postIdParser } from '../utils/fetch'
import { memoize } from 'lodash-es'
import Services from '../../../extension/service'
import { postAvatarsContentSelector, postsImageSelector } from '../utils/selector'
import { ProfileIdentifier } from '../../../database/type'
import { postParser, postImagesParser } from '../utils/fetch'
import { untilElementAvailable } from '../../../utils/dom'
import {
    makeTypedMessageImage,
    makeTypedMessageTupleFromList,
    makeTypedMessageEmpty,
    makeTypedMessagePromise,
    makeTypedMessageTuple,
} from '../../../protocols/typed-message'
import { twitterBase } from '../base'
import { twitterShared } from '../shared'
import { createRefsForCreatePostContext } from '../../../social-network/utils/create-post-context'
import { currentSelectedIdentity } from '../../../settings/settings'

function registerAvatarCollectorInner(
    postStore: Next.CollectingCapabilities.AvatarProvider['avatarPosts'],
    cancel: AbortSignal,
) {
    const getTweetNode = (node: HTMLElement) => {
        const root = node.closest<HTMLDivElement>(
            [
                'article > div',
                'div[data-testid="tweet"]', // retweet in new twitter
            ].join(),
        )
        if (!root) return null

        return root
    }

    const getCurrentIdentifier = () => {
        const current = currentSelectedIdentity[activatedSocialNetworkUI.networkIdentifier]
        return (
            globalUIState.profiles.value.find((i) => i.identifier.toText() === current.value) ||
            globalUIState.profiles.value[0]
        )
    }
    const updateProfileInfo = memoize(
        (info: PostInfo) => {
            const currentProfile = getCurrentIdentifier()
            const profileIdentifier = info.postBy.getCurrentValue()
            Services.Identity.updateProfileInfo(profileIdentifier, {
                nickname: info.nickname.getCurrentValue(),
                avatarURL: info.avatarURL.getCurrentValue(),
            })
            if (currentProfile?.linkedPersona) {
                Services.Identity.createNewRelation(profileIdentifier, currentProfile.linkedPersona.identifier)
            }
        },
        (info: PostInfo) => info.postBy.getCurrentValue()?.toText(),
    )
    const watcher = new IntervalWatcher(postAvatarsContentSelector())
        .useForeach((node, _, proxy) => {
            const tweetNode = getTweetNode(node)
            if (!tweetNode) return
            const refs = createRefsForCreatePostContext()
            const info = twitterShared.utils.createPostContext({
                comments: undefined,
                rootElement: proxy,
                suggestedInjectionPoint: tweetNode,
                ...refs.subscriptions,
            })
            function run() {
                collectPostInfo(tweetNode, refs, cancel)
                collectLinks(tweetNode, refs, cancel)
            }
            run()
            cancel.addEventListener(
                'abort',
                info.postPayload.subscribe(() => {
                    const payload = info.postPayload.getCurrentValue()
                    if (!payload) return
                    if (payload.err && refs.postMetadataImages.size === 0) return
                    updateProfileInfo(info)
                }),
            )
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
    watcher.startWatch(250)
    cancel.addEventListener('abort', () => watcher.stopWatch())
}

export const AvatarProviderTwitter: Next.CollectingCapabilities.AvatarProvider = {
    avatarPosts: createorAvatar.AvatarProviderStore(),
    start(cancel) {
        registerAvatarCollectorInner(this.avatarPosts, cancel)
    },
}

function collectPostInfo(
    tweetNode: HTMLDivElement | null,
    info: ReturnType<typeof createRefsForCreatePostContext>,
    cancel: AbortSignal,
) {
    if (!tweetNode) return
    if (cancel?.aborted) return
    const { pid, messages, handle, name, avatar } = postParser(tweetNode)

    if (!pid) return
    const postBy = handle ? new ProfileIdentifier(twitterBase.networkIdentifier, handle) : ProfileIdentifier.unknown
    info.postID.value = pid
    if (!info.postBy.value.equals(postBy)) info.postBy.value = postBy
    info.nickname.value = name
    info.avatarURL.value = avatar || null

    // decode steganographic image
    // don't add await on this
    const images = untilElementAvailable(postsImageSelector(tweetNode), 10000)
        .then(() => postImagesParser(tweetNode))
        .then((urls) => {
            for (const url of urls) info.postMetadataImages.add(url)
            if (urls.length) return makeTypedMessageTupleFromList(...urls.map((x) => makeTypedMessageImage(x)))
            return makeTypedMessageEmpty()
        })
        .catch(() => makeTypedMessageEmpty())

    info.postMessage.value = makeTypedMessageTuple([...messages, makeTypedMessagePromise(images)])
}

function collectLinks(
    tweetNode: HTMLDivElement | null,
    info: ReturnType<typeof createRefsForCreatePostContext>,
    cancel: AbortSignal,
) {
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
        })
    }
}
