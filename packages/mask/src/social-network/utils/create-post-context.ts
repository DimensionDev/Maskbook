import { ValueRef } from '@dimensiondev/holoflows-kit'
import { encodeArrayBuffer } from '@dimensiondev/kit'
import type { PostContext, PostContextAuthor, PostContextCreation, PostContextSNSActions } from '@masknet/plugin-infra'
import {
    ALL_EVENTS,
    extractTextFromTypedMessage,
    isTypedMessageEqual,
    makeTypedMessageTupleFromList,
    ObservableMap,
    ObservableSet,
    parseURL,
    PostIdentifier,
    ProfileIdentifier,
    TypedMessage,
    TypedMessageTuple,
    SubscriptionFromValueRef,
    SubscriptionDebug as debug,
    mapSubscription,
    createSubscriptionFromAsync,
    waitTypedMessage,
    makeTypedMessageEmpty,
    flattenTypedMessage,
    createConstantSubscription,
} from '@masknet/shared-base'
import type { Subscription } from 'use-subscription'
import { activatedSocialNetworkUI } from '../'
import { nonNullable } from '../../../utils-pure'
import { FACEBOOK_ID } from '../../social-network-adaptor/facebook.com/base'
import { resolveFacebookLink } from '../../social-network-adaptor/facebook.com/utils/resolveFacebookLink'

export function createSNSAdaptorSpecializedPostContext(create: PostContextSNSActions) {
    return function createPostContext(opt: PostContextCreation): PostContext {
        const cancel: (Function | undefined)[] = []
        opt.signal?.addEventListener('abort', () => cancel.forEach((fn) => fn?.()))

        //#region Mentioned links
        const links = new ObservableSet<string>()
        {
            async function fillLinks() {
                const message = await waitTypedMessage(opt.rawMessage.getCurrentValue())
                const text = extractTextFromTypedMessage(message).unwrapOr('')
                const link = parseURL(text).concat(opt.postMentionedLinksProvider?.getCurrentValue() || [])
                links.clear()
                for (const x of link) {
                    if (activatedSocialNetworkUI.networkIdentifier === FACEBOOK_ID) {
                        links.add(resolveFacebookLink(x))
                    } else links.add(x)
                }
            }
            fillLinks()
            cancel.push(opt.rawMessage.subscribe(fillLinks))
        }
        const linksSubscribe: Subscription<string[]> = debug({
            getCurrentValue: () => [...links],
            subscribe: (sub) => links.event.on(ALL_EVENTS, sub),
        })
        //#endregion
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
        const MaskPayloads: PostContext['maskPayloads'] = new ObservableMap()
        function calculateCommentEncryptionIV() {
            const all = [...MaskPayloads.values()]
                .map((x) => x.iv.getCurrentValue()?.buffer)
                .filter(nonNullable)
                .map(encodeArrayBuffer)
                .sort()
            return all[0] as string | null
        }
        return {
            author: author.author,
            avatarURL: author.avatarURL,
            nickname: author.nickname,
            snsID: author.snsID,

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

            rawMessage: opt.rawMessage,
            rawMessagePiped: transformedPostContent,

            async decryptPostComment() {
                throw new Error('TODO')
            },
            async encryptPostComment() {
                throw new Error('TODO')
            },
            containsMaskPayload: {
                getCurrentValue: () => MaskPayloads.size !== 0,
                subscribe: (sub) => MaskPayloads.event.on(ALL_EVENTS, sub),
            },
            maskPayloads: MaskPayloads,
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
