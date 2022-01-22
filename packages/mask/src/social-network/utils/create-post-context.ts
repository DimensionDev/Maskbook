import { ValueRef } from '@dimensiondev/holoflows-kit'
import type { PostContext, PostContextAuthor, PostContextCreation, PostContextSNSActions } from '@masknet/plugin-infra'
import {
    ALL_EVENTS,
    extractTextFromTypedMessage,
    isTypedMessageEqual,
    makeTypedMessageTupleFromList,
    ObservableMap,
    ObservableSet,
    parseURL,
    Payload,
    PostIdentifier,
    ProfileIdentifier,
    TypedMessage,
    TypedMessageTuple,
    SubscriptionFromValueRef,
    SubscriptionDebug as debug,
    mapSubscription,
} from '@masknet/shared-base'
import { Err, Result } from 'ts-results'
import type { Subscription } from 'use-subscription'
import { activatedSocialNetworkUI } from '../'
import { resolveFacebookLink } from '../../social-network-adaptor/facebook.com/utils/resolveFacebookLink'

export function createSNSAdaptorSpecializedPostContext(create: PostContextSNSActions) {
    return function createPostContext(opt: PostContextCreation): PostContext {
        const cancel: (Function | undefined)[] = []
        opt.signal?.addEventListener('abort', () => cancel.forEach((fn) => fn?.()))

        // #region Post text content
        const postContent = new ValueRef(extractText())
        cancel.push(opt.rawMessage.subscribe(() => (postContent.value = extractText())))
        function extractText() {
            return extractTextFromTypedMessage(opt.rawMessage.getCurrentValue()).unwrapOr('')
        }
        // #endregion

        // #region Mentioned links
        const links = new ObservableSet<string>()
        cancel.push(
            postContent.addListener((post) => {
                links.clear()
                parseURL(post).forEach((link) =>
                    links.add(resolveFacebookLink(link, activatedSocialNetworkUI.networkIdentifier)),
                )
                opt.postMentionedLinksProvider
                    ?.getCurrentValue()
                    .forEach((link) => links.add(resolveFacebookLink(link, activatedSocialNetworkUI.networkIdentifier)))
            }),
        )
        cancel.push(
            opt.postMentionedLinksProvider?.subscribe(() => {
                // Not clean old links cause post content not changed
                opt.postMentionedLinksProvider
                    ?.getCurrentValue()
                    .forEach((link) => links.add(resolveFacebookLink(link, activatedSocialNetworkUI.networkIdentifier)))
            }),
        )
        const linksSubscribe: Subscription<string[]> = debug({
            getCurrentValue: () => [...links],
            subscribe: (sub) => links.event.on(ALL_EVENTS, sub),
        })
        // #endregion

        // #region Parse payload
        const postPayload = new ValueRef<Result<Payload, unknown>>(Err(new Error('Empty')))
        parsePayload()
        cancel.push(postContent.addListener(parsePayload))
        cancel.push(linksSubscribe.subscribe(parsePayload))
        function parsePayload() {
            // TODO: Also parse for payload in the image.
            let lastResult: Result<Payload, unknown> = Err(new Error('No candidate'))
            for (const each of (create.payloadDecoder || ((x) => [x]))(
                postContent.value + linksSubscribe.getCurrentValue().join('\n'),
            )) {
                lastResult = create.payloadParser(each)
                if (lastResult.ok) {
                    postPayload.value = lastResult
                    return
                }
            }
            if (postPayload.value.err) postPayload.value = lastResult
        }
        // #endregion
        const author: PostContextAuthor = {
            avatarURL: opt.avatarURL,
            nickname: opt.nickname,
            author: opt.author,
            snsID: opt.snsID,
        }
        const transformedPostContent = new ValueRef(makeTypedMessageTupleFromList(), isTypedMessageEqual)
        const postIdentifier = debug({
            getCurrentValue: () => {
                const by = opt.author.getCurrentValue()
                const id = opt.snsID.getCurrentValue()
                if (by.isUnknown || id === null) return null
                return new PostIdentifier(by, id)
            },
            subscribe: (sub) => {
                const a = opt.author.subscribe(sub)
                const b = opt.snsID.subscribe(sub)
                return () => void [a(), b()]
            },
        })
        return {
            ...author,

            get rootNode() {
                return opt.rootElement.realCurrent
            },
            rootElement: opt.rootElement,
            suggestedInjectionPoint: opt.suggestedInjectionPoint,

            comment: opt.comments,

            identifier: postIdentifier,
            url: debug({
                getCurrentValue: () => {
                    const id = postIdentifier.getCurrentValue()
                    if (id) return create.getURLFromPostIdentifier?.(id) || null
                    return null
                },
                subscribe: (sub) => postIdentifier.subscribe(sub),
            }),

            mentionedLinks: linksSubscribe,
            postMetadataImages:
                opt.postImagesProvider ||
                debug({
                    getCurrentValue: () => [],
                    subscribe: () => () => {},
                }),

            rawMessage: opt.rawMessage,
            rawMessagePiped: transformedPostContent,
            postContent: SubscriptionFromValueRef(postContent),

            containingMaskPayload: SubscriptionFromValueRef(postPayload),
            decryptedPayloadForImage: new ValueRef(null),
            iv: new ValueRef(null),
            publicShared: debug({
                getCurrentValue: () =>
                    postPayload.value
                        .map((val) => val.version === -38 && val.sharedPublic)
                        .unwrapOr<undefined>(undefined),
                subscribe: (sub) => postPayload.addListener(sub),
            }),
        }
    }
}
export function createRefsForCreatePostContext() {
    const avatarURL = new ValueRef<string | null>(null)
    const nickname = new ValueRef<string | null>(null)
    const postBy = new ValueRef<ProfileIdentifier>(ProfileIdentifier.unknown, ProfileIdentifier.equals)
    const postID = new ValueRef<string | null>(null)
    const postMessage = new ValueRef<TypedMessageTuple<readonly TypedMessage[]>>(makeTypedMessageTupleFromList())
    const postMetadataImages = new ObservableSet<string>()
    const postMetadataMentionedLinks = new ObservableMap<unknown, string>()
    const subscriptions: Omit<PostContextCreation, 'rootElement' | 'suggestedInjectionPoint'> = {
        avatarURL: mapSubscription(SubscriptionFromValueRef(avatarURL), (x) => {
            if (!x) return null
            try {
                return new URL(x)
            } catch {}
            return null
        }),
        nickname: SubscriptionFromValueRef(nickname),
        author: SubscriptionFromValueRef(postBy),
        snsID: SubscriptionFromValueRef(postID),
        rawMessage: SubscriptionFromValueRef(postMessage),
        postImagesProvider: debug({
            getCurrentValue: () => [...postMetadataImages],
            subscribe: (sub) => postMetadataImages.event.on(ALL_EVENTS, sub),
        }),
        postMentionedLinksProvider: debug({
            getCurrentValue: () => [...postMetadataMentionedLinks.values()],
            subscribe: (sub) => postMetadataMentionedLinks.event.on(ALL_EVENTS, sub),
        }),
    }
    return {
        subscriptions,
        avatarURL,
        nickname,
        postBy,
        postID,
        postMessage,
        postMetadataMentionedLinks,
        postMetadataImages,
    }
}
