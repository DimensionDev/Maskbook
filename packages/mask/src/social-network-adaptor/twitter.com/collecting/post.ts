import { postsContentSelector, postsImageSelector, timelinePostContentSelector } from '../utils/selector'
import { IntervalWatcher, DOMProxy, DOMProxyEvents } from '@dimensiondev/holoflows-kit'
import type { EventListener } from '@servie/events'
import { creator, globalUIState, SocialNetworkUI as Next } from '../../../social-network'
import type { PostInfo } from '@masknet/plugin-infra/content-script'
import { postIdParser, postParser, postImagesParser, postContentMessageParser } from '../utils/fetch'
import { memoize, noop } from 'lodash-unified'
import Services from '../../../extension/service'
import { injectMaskIconToPostTwitter } from '../injection/MaskIcon'
import { PostIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import {
    makeTypedMessageImage,
    makeTypedMessageTupleFromList,
    makeTypedMessageEmpty,
    makeTypedMessagePromise,
    makeTypedMessageTuple,
    isTypedMessageText,
    isTypedMessageAnchor,
} from '@masknet/typed-message'
import { untilElementAvailable } from '../../../utils/dom'
import { twitterBase } from '../base'
import { twitterShared } from '../shared'
import { createRefsForCreatePostContext } from '../../../social-network/utils/create-post-context'
import { getCurrentIdentifier } from '../../utils'
import { IdentityProviderTwitter } from './identity'

function getPostActionsNode(postNode: HTMLElement | null) {
    if (!postNode) return null
    return postNode.closest('[data-testid="tweet"]')?.querySelector<HTMLElement>('[role="group"] > div:last-child')
}

const getParentTweetNode = (node: HTMLElement) => {
    return node.closest<HTMLElement>('[data-testid="tweet"]')
}

function isQuotedTweet(tweetNode: HTMLElement | null) {
    return tweetNode?.getAttribute('role') === 'link'
}

function registerPostCollectorInner(
    postStore: Next.CollectingCapabilities.PostsProvider['posts'],
    cancel: AbortSignal,
) {
    const getTweetNode = (node: HTMLElement) => {
        const root = node.closest<HTMLDivElement>(
            [
                'article > div',
                'div[role="link"]', // retweet(quoted tweet) in new twitter
            ].join(),
        )
        if (!root) return null

        const isCardNode = node.matches('[data-testid="card.wrapper"]')
        const hasTextNode = !!root.querySelector(
            [
                '[data-testid="tweet"] div[lang]', // timeline
                '[data-testid="tweet"] + div div[lang]', // detailed
            ].join(),
        )

        // if a text node already exists, it's not going to decrypt the card node
        if (isCardNode && hasTextNode) return null

        return root
    }

    const updateProfileInfo = memoize(
        (info: PostInfo) => {
            const currentProfile = getCurrentIdentifier()
            const profileIdentifier = info.author.getCurrentValue()
            if (!profileIdentifier) return
            Services.Identity.updateProfileInfo(profileIdentifier, {
                nickname: info.nickname.getCurrentValue(),
                avatarURL: info.avatarURL.getCurrentValue()?.toString(),
            })
            if (currentProfile?.linkedPersona) {
                Services.Identity.createNewRelation(profileIdentifier, currentProfile.linkedPersona.identifier)
            }
        },
        (info: PostInfo) => info.author.getCurrentValue()?.toText(),
    )
    const watcher = new IntervalWatcher(postsContentSelector())
        .useForeach((node, _, proxy) => {
            const tweetNode = getTweetNode(node)
            if (!tweetNode) return
            const refs = createRefsForCreatePostContext()
            let actionsElementProxy: DOMProxy | undefined = undefined
            const actionsInjectPoint = getPostActionsNode(proxy.current)
            let unwatchPostNodeChange = noop
            if (actionsInjectPoint && !isQuotedTweet(tweetNode)) {
                actionsElementProxy = DOMProxy({})
                actionsElementProxy.realCurrent = actionsInjectPoint
                const handleChanged: EventListener<DOMProxyEvents<HTMLElement>, 'currentChanged'> = (e) => {
                    actionsElementProxy!.realCurrent = getPostActionsNode(e.new) || null
                }
                proxy.on('currentChanged', handleChanged)
                unwatchPostNodeChange = () => {
                    proxy.off('currentChanged', handleChanged)
                }
            }
            const info = twitterShared.utils.createPostContext({
                comments: undefined,
                rootElement: proxy,
                actionsElement: actionsElementProxy,
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
                info.containingMaskPayload.subscribe(() => {
                    const payload = info.containingMaskPayload.getCurrentValue()
                    if (payload.err && refs.postMetadataImages.size === 0) return
                    updateProfileInfo(info)
                }),
            )
            injectMaskIconToPostTwitter(info, cancel)
            postStore.set(proxy, info)
            return {
                onTargetChanged: run,
                onRemove: () => {
                    postStore.delete(proxy)
                    unwatchPostNodeChange()
                },
                onNodeMutation: run,
            }
        })
        .assignKeys((node) => {
            const tweetNode = getTweetNode(node)
            const parentTweetNode = isQuotedTweet(tweetNode) ? getParentTweetNode(tweetNode!) : null
            if (!tweetNode) return node.innerText
            const parentTweetId = parentTweetNode ? postIdParser(parentTweetNode) : ''
            const tweetId = postIdParser(tweetNode)
            return `${parentTweetId}/${tweetId}`
        })
    watcher.startWatch(250)
    cancel.addEventListener('abort', () => watcher.stopWatch())
}

export const PostProviderTwitter: Next.CollectingCapabilities.PostsProvider = {
    posts: creator.EmptyPostProviderState(),
    start(cancel) {
        registerPostCollectorInner(this.posts, cancel)
    },
}

export function collectVerificationPost(keyword: string) {
    const userId = IdentityProviderTwitter.recognized.value.identifier || globalUIState.profiles.value[0].identifier
    const postNodes = timelinePostContentSelector().evaluate()

    for (const postNode of postNodes) {
        const postId = postIdParser(postNode)
        const postContent = postContentMessageParser(postNode)
        const content = postContent
            .map((x) => {
                if (isTypedMessageText(x)) return x.content ?? ''
                if (isTypedMessageAnchor(x) && x.category === 'user') return x.content ?? ''
                if (isTypedMessageAnchor(x) && x.category === 'normal')
                    return (x.content ?? '').replace(/http(.*)\/\//g, '')
                return ''
            })
            .join('')
        const isVerified =
            postId &&
            content.toLowerCase().replace(/\r\n|\n|\r/gm, '') === keyword.toLowerCase().replace(/\r\n|\n|\r/gm, '')

        if (isVerified && userId) {
            return new PostIdentifier(userId, postId)
        }
    }

    return null
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
    const postBy = ProfileIdentifier.of(twitterBase.networkIdentifier, handle).unwrapOr(null)
    info.postID.value = pid
    info.postBy.value = postBy
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
