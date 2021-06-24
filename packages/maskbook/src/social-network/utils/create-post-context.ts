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
    SubscriptionFromValueRef,
    TypedMessage,
    TypedMessageTuple,
} from '@masknet/shared'
import { Err, Result } from 'ts-results'
import type { Subscription } from 'use-subscription'

export function createSNSAdaptorSpecializedPostContext(create: PostContextSNSActions) {
    return function createPostContext(opt: PostContextCreation): PostContext {
        const cancel: (Function | undefined)[] = []
        opt.signal?.addEventListener('abort', () => cancel.forEach((f) => f && f()))

        //#region Post text content
        const postContent = new ValueRef(extractText())
        cancel.push(opt.rawMessage.subscribe(() => (postContent.value = extractText())))
        function extractText() {
            return extractTextFromTypedMessage(opt.rawMessage.getCurrentValue()).unwrapOr('')
        }
        //#endregion

        //#region Mentioned links
        const links = new ObservableSet<string>()
        cancel.push(
            postContent.addListener((post) => {
                links.clear()
                parseURL(post).forEach((link) => links.add(link))
                opt.postMentionedLinksProvider?.getCurrentValue().forEach((link) => links.add(link))
            }),
        )
        cancel.push(
            opt.postMentionedLinksProvider?.subscribe(() => {
                // Not clean old links cause post content not changed
                opt.postMentionedLinksProvider?.getCurrentValue().forEach((link) => links.add(link))
            }),
        )
        const linksSubscribe: Subscription<string[]> = {
            getCurrentValue: () => [...links],
            subscribe: (sub) => links.event.on(ALL_EVENTS, sub),
        }
        //#endregion

        //#region Parse payload
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
        //#endregion
        const author: PostContextAuthor = {
            avatarURL: opt.avatarURL,
            nickname: opt.nickname,
            postBy: opt.postBy,
            postID: opt.postID,
            url: opt.url,
        }
        const transformedPostContent = new ValueRef(makeTypedMessageTupleFromList(), isTypedMessageEqual)
        return {
            ...author,

            get rootNode() {
                return opt.rootElement.realCurrent
            },
            rootNodeProxy: opt.rootElement,
            postContentNode: opt.suggestedInjectionPoint,

            comment: opt.comments,
            commentBoxSelector: opt.comments?.commentBoxSelector,
            commentsSelector: opt.comments?.commentsSelector,

            postIdentifier: {
                getCurrentValue: () => {
                    const by = opt.postBy.getCurrentValue()
                    const id = opt.postID.getCurrentValue()
                    if (by.isUnknown || id === null) return null
                    return new PostIdentifier(by, id)
                },
                subscribe: (sub) => {
                    const a = opt.postBy.subscribe(sub)
                    const b = opt.postID.subscribe(sub)
                    return () => void [a(), b()]
                },
            },

            postMentionedLinks: linksSubscribe,
            postMetadataImages: opt.postImagesProvider || {
                getCurrentValue: () => [],
                subscribe: () => () => {},
            },
            postMetadataMentionedLinks: linksSubscribe,

            postMessage: opt.rawMessage,
            transformedPostContent,
            postContent: SubscriptionFromValueRef(postContent),

            postPayload: SubscriptionFromValueRef(postPayload),
            decryptedPayloadForImage: new ValueRef(null),
            iv: new ValueRef(null),
            publicShared: {
                getCurrentValue: () =>
                    postPayload.value
                        .map((val) => val.version === -38 && val.sharedPublic)
                        .unwrapOr<undefined>(undefined),
                subscribe: (sub) => postPayload.addListener(sub),
            },
        }
    }
}
export function createRefsForCreatePostContext() {
    const avatarURL = new ValueRef<string | null>(null)
    const nickname = new ValueRef<string | null>(null)
    const postBy = new ValueRef<ProfileIdentifier>(ProfileIdentifier.unknown, ProfileIdentifier.equals)
    const postID = new ValueRef<string | null>(null)
    const url = new ValueRef<URL | null>(null)
    const postMessage = new ValueRef<TypedMessageTuple<readonly TypedMessage[]>>(makeTypedMessageTupleFromList())
    const postMetadataImages = new ObservableSet<string>()
    const postMetadataMentionedLinks = new ObservableMap<unknown, string>()
    const subscriptions: Omit<PostContextCreation, 'rootElement' | 'suggestedInjectionPoint'> = {
        avatarURL: SubscriptionFromValueRef(avatarURL),
        nickname: SubscriptionFromValueRef(nickname),
        postBy: SubscriptionFromValueRef(postBy),
        postID: SubscriptionFromValueRef(postID),
        url: SubscriptionFromValueRef(url),
        rawMessage: SubscriptionFromValueRef(postMessage),
        postImagesProvider: {
            getCurrentValue: () => [...postMetadataImages],
            subscribe: (sub) => postMetadataImages.event.on(ALL_EVENTS, sub),
        },
        postMentionedLinksProvider: {
            getCurrentValue: () => [...postMetadataMentionedLinks.values()],
            subscribe: (sub) => postMetadataMentionedLinks.event.on(ALL_EVENTS, sub),
        },
    }
    return {
        subscriptions,
        avatarURL,
        nickname,
        postBy,
        postID,
        url,
        postMessage,
        postMetadataMentionedLinks,
        postMetadataImages,
    }
}
