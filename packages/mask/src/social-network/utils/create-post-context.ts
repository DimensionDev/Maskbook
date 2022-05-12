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
    PostIdentifier,
    ProfileIdentifier,
    createSubscriptionFromValueRef,
    SubscriptionDebug as debug,
    mapSubscription,
    EMPTY_LIST,
    PostIVIdentifier,
    EnhanceableSite,
} from '@masknet/shared-base'
import type { Subscription } from 'use-subscription'
import { activatedSocialNetworkUI } from '../ui'
import { resolveFacebookLink } from '../../social-network-adaptor/facebook.com/utils/resolveFacebookLink'
import type { SupportedPayloadVersions } from '@masknet/encryption'

export function createSNSAdaptorSpecializedPostContext(create: PostContextSNSActions) {
    return function createPostContext(opt: PostContextCreation): PostContext {
        const cancel: (Function | undefined)[] = []
        opt.signal?.addEventListener('abort', () => cancel.forEach((fn) => fn?.()))

        // #region Mentioned links
        const linksSubscribe: Subscription<string[]> = (() => {
            const isFacebook = activatedSocialNetworkUI.networkIdentifier === EnhanceableSite.Facebook
            const links = new ValueRef<string[]>(EMPTY_LIST)

            function evaluate() {
                const text = parseURL(extractTextFromTypedMessage(opt.rawMessage.getCurrentValue()).unwrapOr(''))
                    .concat(opt.postMentionedLinksProvider?.getCurrentValue() || EMPTY_LIST)
                    .map(isFacebook ? resolveFacebookLink : (x) => x)
                // eslint-disable-next-line @dimensiondev/array/no-implicit-sort
                if (text.sort().join(';') === links.value.join(';')) return
                if (!text.length) links.value = EMPTY_LIST
                else links.value = text
            }
            cancel.push(opt.rawMessage.subscribe(evaluate))
            cancel.push(opt.postMentionedLinksProvider?.subscribe(evaluate))
            return createSubscriptionFromValueRef(links)
        })()
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
                if (!id || !by) return null
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
            url: mapSubscription(postIdentifier, (id) => {
                if (id) return create.getURLFromPostIdentifier?.(id) || null
                return null
            }),

            mentionedLinks: linksSubscribe,
            postMetadataImages:
                opt.postImagesProvider ||
                debug({
                    getCurrentValue: () => EMPTY_LIST,
                    subscribe: () => () => {},
                }),

            rawMessage: opt.rawMessage,

            hasMaskPayload: (() => {
                const hasMaskPayload = new ValueRef(false)
                function evaluate() {
                    const msg =
                        extractTextFromTypedMessage(opt.rawMessage.getCurrentValue()).unwrapOr('') +
                        '\n' +
                        [...linksSubscribe.getCurrentValue()].join('\n')
                    hasMaskPayload.value = create.hasPayloadLike(msg)
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
