import { ValueRef } from '@dimensiondev/holoflows-kit'
import type {
    PostContext,
    PostContextAuthor,
    PostContextCreation,
    PostContextSNSActions,
} from '@masknet/plugin-infra/content-script'
import {
    extractTextFromTypedMessage,
    makeTypedMessageTupleFromList,
    type TypedMessage,
    type TypedMessageTuple,
} from '@masknet/typed-message'
import {
    ALL_EVENTS,
    ObservableMap,
    ObservableSet,
    parseURL,
    Payload,
    PostIdentifier,
    ProfileIdentifier,
    createSubscriptionFromValueRef,
    SubscriptionDebug as debug,
    mapSubscription,
    EMPTY_LIST,
    PostIVIdentifier,
    EnhanceableSite,
} from '@masknet/shared-base'
import { Err, Result } from 'ts-results'
import type { Subscription } from 'use-subscription'
import { activatedSocialNetworkUI } from '../ui'
import { resolveFacebookLink } from '../../social-network-adaptor/facebook.com/utils/resolveFacebookLink'
import type { SupportedPayloadVersions } from '@masknet/encryption'

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
        const isFacebook = activatedSocialNetworkUI.networkIdentifier === EnhanceableSite.Facebook
        const links = new ObservableSet<string>()
        cancel.push(
            postContent.addListener((post) => {
                links.clear()
                parseURL(post).forEach((link) => links.add(isFacebook ? resolveFacebookLink(link) : link))
                opt.postMentionedLinksProvider
                    ?.getCurrentValue()
                    .forEach((link) => links.add(isFacebook ? resolveFacebookLink(link) : link))
            }),
        )
        cancel.push(
            opt.postMentionedLinksProvider?.subscribe(() => {
                // Not clean old links cause post content not changed
                opt.postMentionedLinksProvider
                    ?.getCurrentValue()
                    .forEach((link) => links.add(isFacebook ? resolveFacebookLink(link) : link))
            }),
        )
        const linksSubscribe: Subscription<string[]> = debug({
            getCurrentValue: () => (links.size ? [...links] : EMPTY_LIST),
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
        const postIdentifier = debug({
            getCurrentValue: () => {
                const by = opt.author.getCurrentValue()
                const id = opt.snsID.getCurrentValue()
                if (id === null || !by) return null
                return new PostIdentifier(by, id)
            },
            subscribe: (sub) => {
                const a = opt.author.subscribe(sub)
                const b = opt.snsID.subscribe(sub)
                return () => void [a(), b()]
            },
        })
        const postIVIdentifier = new ValueRef<PostIVIdentifier | null>(null)
        const isPublicShared = new ValueRef<boolean | undefined>(undefined)
        const isAuthorOfPost = new ValueRef<boolean | undefined>(undefined)
        const version = new ValueRef<SupportedPayloadVersions | undefined>(undefined)
        return {
            author: author.author,
            avatarURL: author.avatarURL,
            nickname: author.nickname,
            snsID: author.snsID,

            get rootNode() {
                return opt.rootElement.realCurrent
            },
            rootElement: opt.rootElement,
            actionsElement: opt.actionsElement,
            suggestedInjectionPoint: opt.suggestedInjectionPoint,

            comment: opt.comments,
            encryptComment: new ValueRef(null),
            decryptComment: new ValueRef(null),

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
                    getCurrentValue: () => EMPTY_LIST,
                    subscribe: () => () => {},
                }),

            rawMessage: opt.rawMessage,

            containingMaskPayload: createSubscriptionFromValueRef(postPayload),
            postIVIdentifier: createSubscriptionFromValueRef(postIVIdentifier),
            publicShared: createSubscriptionFromValueRef(isPublicShared),
            isAuthorOfPost: createSubscriptionFromValueRef(isAuthorOfPost),
            version: createSubscriptionFromValueRef(version),
            decryptedReport(opts) {
                const currentAuthor = author.author.getCurrentValue()
                if (opts.iv && currentAuthor)
                    postIVIdentifier.value = new PostIVIdentifier(currentAuthor.network, opts.iv)
                if (opts.sharedPublic?.some) isPublicShared.value = opts.sharedPublic.val
                if (opts.isAuthorOfPost) isAuthorOfPost.value = opts.isAuthorOfPost.val
                if (opts.version) version.value = opts.version
            },
        }
    }
}
export function createRefsForCreatePostContext() {
    const avatarURL = new ValueRef<string | null>(null)
    const nickname = new ValueRef<string | null>(null)
    const postBy = new ValueRef<ProfileIdentifier | null>(null)
    const postID = new ValueRef<string | null>(null)
    const postMessage = new ValueRef<TypedMessageTuple<readonly TypedMessage[]>>(makeTypedMessageTupleFromList())
    const postMetadataImages = new ObservableSet<string>()
    const postMetadataMentionedLinks = new ObservableMap<unknown, string>()
    const subscriptions: Omit<PostContextCreation, 'rootElement' | 'actionsElement' | 'suggestedInjectionPoint'> = {
        avatarURL: mapSubscription(createSubscriptionFromValueRef(avatarURL), (x) => {
            if (!x) return null
            try {
                return new URL(x)
            } catch {}
            return null
        }),
        nickname: createSubscriptionFromValueRef(nickname),
        author: createSubscriptionFromValueRef(postBy),
        snsID: createSubscriptionFromValueRef(postID),
        rawMessage: createSubscriptionFromValueRef(postMessage),
        postImagesProvider: debug({
            getCurrentValue: () => (postMetadataImages.size ? [...postMetadataImages] : EMPTY_LIST),
            subscribe: (sub) => postMetadataImages.event.on(ALL_EVENTS, sub),
        }),
        postMentionedLinksProvider: debug({
            getCurrentValue: () =>
                postMetadataMentionedLinks.size ? [...postMetadataMentionedLinks.values()] : EMPTY_LIST,
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
