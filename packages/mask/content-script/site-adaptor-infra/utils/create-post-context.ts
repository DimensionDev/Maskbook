import { difference, noop } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import type { SupportedPayloadVersions } from '@masknet/encryption'
import {
    ValueRef,
    ObservableMap,
    ObservableSet,
    parseURLs,
    PostIdentifier,
    type ProfileIdentifier,
    createSubscriptionFromValueRef,
    SubscriptionDebug as debug,
    mapSubscription,
    EMPTY_LIST,
    PostIVIdentifier,
    EnhanceableSite,
    NULL,
} from '@masknet/shared-base'
import type {
    PostContext,
    PostContextAuthor,
    PostContextCoAuthor,
    PostContextCreation,
    PostContextActions,
} from '@masknet/plugin-infra/content-script'
import { extractTextFromTypedMessage, makeTypedMessageEmpty, type TypedMessage } from '@masknet/typed-message'
import { resolveFacebookLink } from '../../site-adaptors/facebook.com/utils/resolveFacebookLink.js'

export function createSiteAdaptorSpecializedPostContext(site: EnhanceableSite, actions: PostContextActions) {
    return function createPostContext(opt: PostContextCreation): PostContext {
        const cancel: Array<() => void> = []
        opt.signal?.addEventListener('abort', () => cancel.forEach((fn) => fn?.()))

        // #region Mentioned links
        const linksSubscribe: Subscription<string[]> = (() => {
            const isFacebook = site === EnhanceableSite.Facebook
            const links = new ValueRef<string[]>(EMPTY_LIST)

            function evaluate() {
                const text = parseURLs(extractTextFromTypedMessage(opt.rawMessage.getCurrentValue()).unwrapOr(''))
                    .concat(opt.postMentionedLinksProvider?.getCurrentValue() || EMPTY_LIST)
                    .map(isFacebook ? resolveFacebookLink : (x: string) => x)
                if (difference(text, links.value).length === 0) return
                if (!text.length) links.value = EMPTY_LIST
                else links.value = text
            }
            cancel.push(opt.rawMessage.subscribe(evaluate))
            const f = opt.postMentionedLinksProvider?.subscribe(evaluate)
            f && cancel.push(f)
            return createSubscriptionFromValueRef(links)
        })()
        // #endregion
        const author: PostContextAuthor = {
            source: null,
            handle: NULL,
            avatarURL: opt.avatarURL,
            nickname: opt.nickname,
            author: opt.author,
            site,
            postID: opt.postID,
        }
        const postIdentifier = debug({
            getCurrentValue: () => {
                const by = opt.author.getCurrentValue()
                const id = opt.postID.getCurrentValue()
                if (!id || !by) return null
                return new PostIdentifier(by, id)
            },
            subscribe: (sub) => {
                const a = opt.author.subscribe(sub)
                const b = opt.postID.subscribe(sub)
                return () => void [a(), b()]
            },
        })
        const postIVIdentifier = new ValueRef<PostIVIdentifier | null>(null)
        const isPublicShared = new ValueRef<boolean | undefined>(undefined)
        const isAuthorOfPost = new ValueRef<boolean | undefined>(undefined)
        const version = new ValueRef<SupportedPayloadVersions | undefined>(undefined)
        return {
            author: author.author,
            handle: NULL,
            coAuthors: opt.coAuthors,
            avatarURL: author.avatarURL,
            nickname: author.nickname,
            site,
            source: opt.source,
            postID: author.postID,

            get rootNode() {
                return opt.rootElement.realCurrent
            },
            rootElement: opt.rootElement,
            actionsElement: opt.actionsElement,
            isFocusing: opt.isFocusing,
            suggestedInjectionPoint: opt.suggestedInjectionPoint,

            comment: opt.comments,
            encryptComment: new ValueRef<any>(null),
            decryptComment: new ValueRef<any>(null),

            identifier: postIdentifier,
            url: mapSubscription(postIdentifier, (id) => {
                if (id) return actions.getURLFromPostIdentifier?.(id) || null
                return null
            }),

            mentionedLinks: linksSubscribe,
            postMetadataImages:
                opt.postImagesProvider ||
                debug({
                    getCurrentValue: () => EMPTY_LIST,
                    subscribe: () => noop,
                }),

            rawMessage: opt.rawMessage,

            hasMaskPayload: (() => {
                const hasMaskPayload = new ValueRef(false)
                function evaluate() {
                    const msg =
                        extractTextFromTypedMessage(opt.rawMessage.getCurrentValue()).unwrapOr('') +
                        '\n' +
                        [...linksSubscribe.getCurrentValue()].join('\n')
                    hasMaskPayload.value = actions.hasPayloadLike(msg)
                }
                evaluate()
                cancel.push(linksSubscribe.subscribe(evaluate))
                cancel.push(opt.rawMessage.subscribe(evaluate))
                return createSubscriptionFromValueRef(hasMaskPayload)
            })(),
            postIVIdentifier: createSubscriptionFromValueRef(postIVIdentifier),
            publicShared: createSubscriptionFromValueRef(isPublicShared),
            isAuthorOfPost: createSubscriptionFromValueRef(isAuthorOfPost),
            version: createSubscriptionFromValueRef(version),
            decryptedReport(opts) {
                const currentAuthor = author.author.getCurrentValue()
                if (opts.iv && currentAuthor)
                    postIVIdentifier.value = new PostIVIdentifier(currentAuthor.network, opts.iv)
                if (opts.sharedPublic?.isSome()) isPublicShared.value = opts.sharedPublic.value
                if (opts.isAuthorOfPost) isAuthorOfPost.value = opts.isAuthorOfPost.value
                if (opts.version) version.value = opts.version
            },
        }
    }
}
export function createRefsForCreatePostContext() {
    const avatarURL = new ValueRef<string | null>(null)
    const nickname = new ValueRef<string | null>(null)
    const postBy = new ValueRef<ProfileIdentifier | null>(null)
    const postCoAuthors = new ValueRef<PostContextCoAuthor[]>([])
    const postID = new ValueRef<string | null>(null)
    const postMessage = new ValueRef<TypedMessage>(makeTypedMessageEmpty())
    const postMetadataImages = new ObservableSet<string>()
    const postMetadataMentionedLinks = new ObservableMap<unknown, string>()
    const subscriptions: Omit<
        PostContextCreation,
        'rootElement' | 'actionsElement' | 'suggestedInjectionPoint' | 'site'
    > = {
        avatarURL: mapSubscription(createSubscriptionFromValueRef(avatarURL), (x) => {
            if (!x) return null
            if (!URL.canParse(x)) return null
            return new URL(x)
        }),
        handle: NULL,
        nickname: createSubscriptionFromValueRef(nickname),
        author: createSubscriptionFromValueRef(postBy),
        postID: createSubscriptionFromValueRef(postID),
        source: null,
        rawMessage: createSubscriptionFromValueRef(postMessage),
        postImagesProvider: debug({
            getCurrentValue: () => postMetadataImages.asValues,
            subscribe: (sub) => postMetadataImages.event.on(postMetadataImages.ALL_EVENTS, sub),
        }),
        postMentionedLinksProvider: debug({
            getCurrentValue: () => postMetadataMentionedLinks.asValues,
            subscribe: (sub) => postMetadataMentionedLinks.event.on(postMetadataMentionedLinks.ALL_EVENTS, sub),
        }),
        coAuthors: createSubscriptionFromValueRef(postCoAuthors),
    }
    return {
        subscriptions,
        avatarURL,
        nickname,
        postBy,
        postID,
        postCoAuthors,
        postMessage,
        postMetadataMentionedLinks,
        postMetadataImages,
    }
}
