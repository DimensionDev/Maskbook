import {
    Identifier,
    isTypedMessageEqual,
    makeTypedMessageTuple,
    ObservableMap,
    ObservableSet,
    parseURL,
    Payload,
    PostIdentifier,
    ProfileIdentifier,
    TypedMessageTuple,
    useObservableValues,
    useValueRef,
} from '@masknet/shared'
import { ValueRef, LiveSelector, DOMProxy } from '@dimensiondev/holoflows-kit'
import { Result, Err } from 'ts-results'
import { Context, createContext, createElement, memo, useContext } from 'react'
import { Subscription, useSubscription } from 'use-subscription'
export abstract class PostInfo {
    constructor() {
        this.postPayload.addListener((payload) => {
            if (payload.ok) this.iv.value = payload.val.iv
        })
    }
    readonly nickname = new ValueRef<string | null>(null)
    readonly avatarURL = new ValueRef<string | null>(null)
    readonly postBy = new ValueRef(ProfileIdentifier.unknown, Identifier.equals)
    readonly postID = new ValueRef<string | null>(null)
    readonly postIdentifier: Subscription<null | PostIdentifier<ProfileIdentifier>> = {
        getCurrentValue: () => {
            const by = this.postBy.value
            const id = this.postID.value
            if (by.isUnknown || id === null) return null
            return new PostIdentifier(by, id)
        },
        subscribe: (sub) => {
            const a = this.postBy.addListener(sub)
            const b = this.postID.addListener(sub)
            return () => void [a(), b()]
        },
    }
    /** The post message in plain text */
    readonly postContent = new ValueRef('')
    /**
     * The un-decrypted post content.
     * It MUST be the original result (but can be updated by the original parser).
     */
    readonly postMessage = new ValueRef<TypedMessageTuple>(makeTypedMessageTuple([]), isTypedMessageEqual)
    /** @deprecated It should appear in the transformedPostContent */
    readonly postPayload = new ValueRef<Result<Payload, Error>>(Err(new Error('Empty')))
    readonly decryptedPayloadForImage = new ValueRef<Payload | null>(null)
    abstract readonly commentsSelector?: LiveSelector<HTMLElement, false>
    abstract readonly commentBoxSelector?: LiveSelector<HTMLElement, false>
    /**
     * The un-decrypted post content after transformation.
     */
    readonly transformedPostContent = new ValueRef<TypedMessageTuple>(makeTypedMessageTuple([]), isTypedMessageEqual)
    readonly iv = new ValueRef<string | null>(null)
    abstract readonly rootNode: HTMLElement
    abstract readonly rootNodeProxy: DOMProxy
    abstract readonly postContentNode?: HTMLElement
    /** The links appears in the post content */
    readonly postMentionedLinks: Subscription<string[]> = {
        getCurrentValue: () => parseURL(this.postContent.value),
        subscribe: (sub) => this.postContent.addListener(sub),
    }
    /**
     * The images as attachment of post
     * @deprecated it should appear in postMessage
     */
    readonly postMetadataImages = new ObservableSet<string>()
    /**
     * The links does not appear in the post content
     * TODO: move it somewhere else
     */
    readonly postMetadataMentionedLinks = new ObservableMap<HTMLAnchorElement, string>()
}
export const emptyPostInfo: PostInfo = new (class extends PostInfo {
    commentBoxSelector = undefined
    commentsSelector = undefined
    rootNode = undefined!
    rootNodeProxy = undefined!
    postContentNode = undefined
})()

const Context = createContext<PostInfo>(emptyPostInfo)
export const PostInfoProvider = memo((props: React.PropsWithChildren<{ post: PostInfo }>) => {
    return createElement(Context.Provider, { value: props.post, children: props.children })
})
export function usePostInfo() {
    return useContext(Context)
}
export const usePostInfoDetails: {
    // Change to use* when https://github.com/microsoft/TypeScript/issues/44643 fixed
    [key in keyof PostInfo]: () => PostInfo[key] extends ValueRef<infer T>
        ? T
        : PostInfo[key] extends ObservableSet<infer T>
        ? T[]
        : PostInfo[key] extends ObservableMap<any, infer T>
        ? T[]
        : PostInfo[key] extends Subscription<infer T>
        ? T
        : PostInfo[key]
} = new Proxy({ __proto__: null } as any, {
    get(_, key) {
        if (typeof key === 'symbol') throw new Error()
        if (_[key]) return _[key]
        _[key] = function usePostInfoDetails() {
            const postInfo = usePostInfo()
            if (!(key in postInfo)) throw new TypeError()
            const k = postInfo[key as keyof PostInfo]
            // eslint-disable-next-line react-hooks/rules-of-hooks
            if (k instanceof ValueRef) return useValueRef<any>(k)
            // eslint-disable-next-line react-hooks/rules-of-hooks
            if (k instanceof ObservableMap) return useObservableValues<any>(k)
            // eslint-disable-next-line react-hooks/rules-of-hooks
            if (k instanceof ObservableSet) return useObservableValues<any>(k)
            // eslint-disable-next-line react-hooks/rules-of-hooks
            if (isSubscription(k)) return useSubscription<any>(k)
            return k
        }
        return _[key]
    },
})
function isSubscription(x: any): x is Subscription<any> {
    return (
        typeof x === 'object' &&
        x !== null &&
        Boolean((x as Subscription<any>).getCurrentValue && (x as Subscription<any>).subscribe)
    )
}

export function usePostInfoSharedPublic(): boolean {
    const info = usePostInfoDetails.postPayload()
    if (info.err) return false
    const payload = info.val
    if (payload.version !== -38) return false
    return !!payload.sharedPublic
}
