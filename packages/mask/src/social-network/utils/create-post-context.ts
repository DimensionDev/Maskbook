import { ValueRef } from '@dimensiondev/holoflows-kit'
import { encodeArrayBuffer, encodeText } from '@dimensiondev/kit'
import type { DecryptProgress, SocialNetworkEnum } from '@masknet/encryption'
import type {
    MaskPayloadContext,
    PostContext,
    PostContextAuthor,
    PostContextCreation,
    PostContextSNSActions,
} from '@masknet/plugin-infra'
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
    combineAbortSignal,
} from '@masknet/shared-base'
import {
    FlattenTypedMessage,
    extractTextFromTypedMessage,
    collectTypedMessagePromise,
    type TypedMessageTuple,
    type TypedMessage,
    makeTypedMessageTupleFromList,
    extractImageFromTypedMessage,
} from '@masknet/typed-message/base'
import type { Subscription } from 'use-subscription'
import { activatedSocialNetworkUI } from '../'
import type { SocialNetworkEncodedPayload } from '../../../background/services/crypto/decryption'
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
        const MaskPayloads = decryptionContext(
            create.socialNetwork,
            {
                mentionedLinks,
                rawMessage: opt.rawMessage,
                author: author.author,
                url,
            },
            opt.signal,
        )
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
            url,

            mentionedLinks: mentionedLinks,

            rawMessage: opt.rawMessage,

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

function decryptionContext(
    currentSocialNetwork: SocialNetworkEnum,
    context: Pick<PostContext, 'rawMessage' | 'mentionedLinks' | 'author' | 'url'>,
    signal?: AbortSignal,
): PostContext['maskPayloads'] {
    const { author, mentionedLinks, rawMessage, url } = context
    const map: PostContext['maskPayloads'] = new ObservableMap()
    const providerMap = new Map<string, MaskPayloadContextProvider>()

    {
        let abort = new AbortController()
        async function decryptByLinks() {
            const links = [...mentionedLinks.getCurrentValue()].sort()
            if (links.length === 0) return
            const key = await hash(links.join(';'))
            await decryption(
                key,
                combineAbortSignal(signal, abort.signal),
                links.map<SocialNetworkEncodedPayload>((link) => ({ type: 'text', text: link })),
            )
        }

        decryptByLinks()
        const f = mentionedLinks.subscribe(() => {
            abort.abort()
            abort = new AbortController()
            decryptByLinks()
        })
        signal?.addEventListener('abort', f)
    }

    {
        let abort = new AbortController()
        async function decryptByPost(
            message = FlattenTypedMessage(rawMessage.getCurrentValue(), {}),
            signal = abort.signal,
        ) {
            // Instant values
            let text = extractTextFromTypedMessage(message).unwrapOr('')
            {
                // Because all links are in the mentionedLinks, we should remove them to avoid duplicate
                const links = mentionedLinks.getCurrentValue()
                links.forEach((link) => (text = text.replace(link, '')))
            }
            if (text.length < 10) text = ''
            const images = extractImageFromTypedMessage(message)
                .filter((x): x is string => typeof x === 'string')
                .sort()
            const payloads: SocialNetworkEncodedPayload[] = []
            if (text) payloads.push({ type: 'text', text })
            payloads.push(...images.map<SocialNetworkEncodedPayload>((url) => ({ type: 'image-url', url })))
            if (payloads.length === 0) return

            // Deferred values
            const promises = collectTypedMessagePromise(message)
            promises.forEach((promise) => {
                promise.then((message) => decryptByPost(message, signal))
            })

            // Instant value parse
            const key = await hash(text + images.join(';'))
            await decryption(key, combineAbortSignal(signal, abort.signal), payloads)
        }

        decryptByPost()
        const reload = () => {
            abort.abort()
            abort = new AbortController()
            decryptByPost()
        }
        const f = rawMessage.subscribe(reload)
        const f2 = mentionedLinks.subscribe(reload)
        signal?.addEventListener('abort', f)
        signal?.addEventListener('abort', f2)
    }

    async function decryption(key: string, signal: AbortSignal, payloads: SocialNetworkEncodedPayload[]) {
        // const decryption = ServicesWithProgress.decryptionWithSocialNetworkDecoding(payloads, {
        //     currentSocialNetwork,
        //     authorHint: author.getCurrentValue(),
        //     currentProfile: CurrentIdentitySubscription.getCurrentValue()?.identifier,
        //     postURL: url.getCurrentValue()?.toString(),
        // })
        // const currentPassIDs = new Set<string>()
        // signal.addEventListener('abort', () => {
        //     currentPassIDs.forEach((id) => {
        //         providerMap.delete(id)
        //         map.delete(id)
        //     })
        // })
        // for await (const [decryptionID, progress] of decryption) {
        //     if (signal.aborted) return
        //     const currentID = `${key}-${decryptionID}`
        //     currentPassIDs.add(currentID)
        //     if (!map.has(decryptionID)) {
        //         const provider = new MaskPayloadContextProvider(currentID)
        //         providerMap.set(currentID, provider)
        //         map.set(currentID, provider.context)
        //     }
        //     const provider = providerMap.get(currentID)!
        //     if (
        //         progress.type === DecryptProgressKind.Success ||
        //         progress.type === DecryptProgressKind.Error ||
        //         progress.type === DecryptProgressKind.Progress
        //     ) {
        //         provider.pushDecryptionProgress(progress)
        //     } else {
        //         const { iv, claimedAuthor, publicShared } = progress
        //         if (typeof publicShared === 'boolean') provider.setPublicShared(publicShared)
        //         if (iv) provider.setIV(iv)
        //         if (claimedAuthor) provider.setAuthor(claimedAuthor)
        //     }
        // }
    }

    return map
}

class MaskPayloadContextProvider {
    constructor(public id: string) {}
    private claimedAuthor = new ValueRef<ProfileIdentifier | null>(null, ProfileIdentifier.equals)
    private decrypted = new ValueRef<DecryptProgress[]>([])
    private iv = new ValueRef<Uint8Array | null>(null)
    private publicShared = new ValueRef<boolean | null>(null)
    context: MaskPayloadContext = {
        id: this.id,
        claimedAuthor: SubscriptionFromValueRef(this.claimedAuthor),
        decrypted: SubscriptionFromValueRef(this.decrypted),
        iv: SubscriptionFromValueRef(this.iv),
        publicShared: SubscriptionFromValueRef(this.publicShared),
    }
    setAuthor(profile: ProfileIdentifier) {
        this.claimedAuthor.value = profile
    }
    pushDecryptionProgress(progress: DecryptProgress) {
        this.decrypted.value = this.decrypted.value.concat(progress)
    }
    setIV(val: Uint8Array) {
        this.iv.value = val
    }
    setPublicShared(val: boolean) {
        this.publicShared.value = val
    }
}

// hash for a stable key of rendering UI, therefore SHA-1 is acceptable
async function hash(text: string) {
    const val = encodeText(text)
    const buf = await crypto.subtle.digest({ name: 'SHA-1' }, val)
    return encodeArrayBuffer(buf)
}
