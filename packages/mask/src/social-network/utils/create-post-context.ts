import { ValueRef } from '@dimensiondev/holoflows-kit'
import type { PostContext, PostContextAuthor, PostContextCreation, PostContextSNSActions } from '@masknet/plugin-infra'
import {
    ALL_EVENTS,
    ObservableMap,
    ObservableSet,
    parseURL,
    PostIdentifier,
    ProfileIdentifier,
    SubscriptionFromValueRef,
    SubscriptionDebug as debug,
    mapSubscription,
} from '@masknet/shared-base'
import {
    FlattenTypedMessage,
    extractTextFromTypedMessage,
    collectTypedMessagePromise,
    type TypedMessageTuple,
    type TypedMessage,
    makeTypedMessageTupleFromList,
} from '@masknet/typed-message/base'
import type { Subscription } from 'use-subscription'
import { activatedSocialNetworkUI } from '../'
import { FACEBOOK_ID } from '../../social-network-adaptor/facebook.com/base'
import { resolveFacebookLink } from '../../social-network-adaptor/facebook.com/utils/resolveFacebookLink'

export function createSNSAdaptorSpecializedPostContext(create: PostContextSNSActions) {
    return function createPostContext(opt: PostContextCreation): PostContext {
        const cancel: (Function | undefined)[] = []
        opt.signal?.addEventListener('abort', () => cancel.forEach((fn) => fn?.()))

        //#region Mentioned links
        const links = new ObservableSet<string>()
        {
            const isFB = activatedSocialNetworkUI.networkIdentifier === FACEBOOK_ID

            let controller = new AbortController()
            function fillLinks() {
                const signal = controller.signal
                function addLink(x: string) {
                    if (signal.aborted) return
                    if (isFB) links.add(resolveFacebookLink(x))
                    else links.add(x)
                }
                // Instant values
                const message = FlattenTypedMessage(opt.rawMessage.getCurrentValue(), {})
                const text = extractTextFromTypedMessage(message).unwrapOr('')
                const link = parseURL(text).concat(opt.postMentionedLinksProvider?.getCurrentValue() || [])
                link.forEach(addLink)

                // Deferred values
                collectTypedMessagePromise(message).forEach((x) =>
                    x.then(extractTextFromTypedMessage).then((x) => x.map(parseURL).map((val) => val.forEach(addLink))),
                )
            }
            const retry = () => {
                controller.abort()
                controller = new AbortController()
                links.clear()
                fillLinks()
            }
            fillLinks()
            cancel.push(opt.rawMessage.subscribe(retry))
            cancel.push(opt.postMentionedLinksProvider?.subscribe(retry))
        }
        const mentionedLinks: Subscription<string[]> = debug({
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
        const url = debug({
            getCurrentValue: () => {
                const id = postIdentifier.getCurrentValue()
                if (id) return create.getURLFromPostIdentifier?.(id) || null
                return null
            },
            subscribe: (sub) => postIdentifier.subscribe(sub),
        })
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
            url,

            mentionedLinks: mentionedLinks,

            rawMessage: opt.rawMessage,

            async decryptPostComment() {
                throw new Error('TODO')
            },
            async encryptPostComment() {
                throw new Error('TODO')
            },
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
