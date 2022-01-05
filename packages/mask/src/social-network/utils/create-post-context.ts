import { ValueRef } from '@dimensiondev/holoflows-kit'
import { encodeArrayBuffer, encodeText } from '@dimensiondev/kit'
import { DecryptProgress, DecryptProgressKind, SocialNetworkEnum } from '@masknet/encryption'
import type {
    MaskPayloadContext,
    PostContext,
    PostContextAuthor,
    PostContextCreation,
    PostContextSNSActions,
} from '@masknet/plugin-infra'
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
    combineAbortSignal,
    extractImageFromTypedMessage,
} from '@masknet/shared-base'
import type { Subscription } from 'use-subscription'
import { activatedSocialNetworkUI } from '../'
import type { SocialNetworkEncodedPayload } from '../../../background/services/crypto/decryption'
import { nonNullable } from '../../../utils-pure'
import { CurrentIdentitySubscription } from '../../components/DataSource/useActivatedUI'
import { ServicesWithProgress } from '../../extension/service'
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
        const url = debug({
            getCurrentValue: () => {
                const id = postIdentifier.getCurrentValue()
                if (id) return create.getURLFromPostIdentifier?.(id) || null
                return null
            },
            subscribe: (sub) => postIdentifier.subscribe(sub),
        })
        const MaskPayloads = decryptionContext(
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

function decryptionContext(
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
        async function decryptByPost() {
            const message = await waitTypedMessage(rawMessage.getCurrentValue())
            let text = extractTextFromTypedMessage(message).unwrapOr('')
            if (text.length < 10) text = ''
            const images = extractImageFromTypedMessage(message)
                .filter((x): x is string => typeof x === 'string')
                .sort()
            const key = await hash(text + images.join(';'))

            const payloads: SocialNetworkEncodedPayload[] = []

            if (text) payloads.push({ type: 'text', text })
            payloads.push(...images.map<SocialNetworkEncodedPayload>((url) => ({ type: 'image-url', url })))
            await decryption(key, combineAbortSignal(signal, abort.signal), payloads)
        }

        decryptByPost()
        const f = mentionedLinks.subscribe(() => {
            abort.abort()
            abort = new AbortController()
            decryptByPost()
        })
        signal?.addEventListener('abort', f)
    }

    async function decryption(key: string, signal: AbortSignal, payloads: SocialNetworkEncodedPayload[]) {
        const decryption = ServicesWithProgress.decryptionWithSocialNetworkDecoding(payloads, {
            // TODO:
            currentSocialNetwork: SocialNetworkEnum.Twitter,
            authorHint: author.getCurrentValue(),
            currentProfile: CurrentIdentitySubscription.getCurrentValue()?.identifier,
            postURL: url.getCurrentValue()?.toString(),
        })
        const currentPassIDs = new Set<string>()
        signal.addEventListener('abort', () => {
            currentPassIDs.forEach((id) => {
                providerMap.delete(id)
                map.delete(id)
            })
            decryption.return()
        })

        for await (const [decryptionID, progress] of decryption) {
            if (signal.aborted) return
            const currentID = `${key}-${decryptionID}`
            currentPassIDs.add(currentID)
            if (!map.has(decryptionID)) {
                const provider = new MaskPayloadContextProvider(decryptionID)
                providerMap.set(currentID, provider)
                map.set(currentID, provider.context)
            }

            const provider = providerMap.get(currentID)!
            if (
                progress.type === DecryptProgressKind.Success ||
                progress.type === DecryptProgressKind.Error ||
                progress.type === DecryptProgressKind.Progress
            ) {
                provider.pushDecryptionProgress(progress)
            } else {
                const { iv, claimedAuthor, publicShared } = progress
                if (typeof publicShared === 'boolean') provider.setPublicShared(publicShared)
                if (iv) provider.setIV(iv)
                if (claimedAuthor) provider.setAuthor(claimedAuthor)
            }
        }
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
async function hash(val: string | Uint8Array) {
    if (typeof val === 'string') val = encodeText(val)
    const buf = await crypto.subtle.digest({ name: 'SHA-1' }, val)
    return encodeArrayBuffer(buf)
}
