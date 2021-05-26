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
} from '@dimensiondev/maskbook-shared'
import { ValueRef, LiveSelector, DOMProxy } from '@dimensiondev/holoflows-kit'
import { Result, Err } from 'ts-results'
import { Context, createContext, createElement, memo, useContext, useRef } from 'react'
export abstract class PostInfo {
    constructor() {
        const calc = () => {
            const by = this.postBy.value
            const id = this.postID.value
            if (by.isUnknown || id === null) this.postIdentifier.value = null
            else this.postIdentifier.value = new PostIdentifier(by, id)
        }
        this.postID.addListener(calc)
        this.postBy.addListener(calc)

        // update in-post links automatically
        this.postContent.addListener((post) => {
            this.postMentionedLinks.clear()
            this.postMentionedLinks.add(...parseURL(post))
        })
        this.postPayload.addListener((payload) => {
            if (payload.ok) this.iv.value = payload.val.iv
        })
    }
    readonly nickname = new ValueRef<string | null>(null)
    readonly avatarURL = new ValueRef<string | null>(null)
    readonly postBy = new ValueRef(ProfileIdentifier.unknown, Identifier.equals)
    readonly postID = new ValueRef<string | null>(null)
    /** This property is auto computed. */
    readonly postIdentifier = new ValueRef<null | PostIdentifier<ProfileIdentifier>>(null, Identifier.equals)
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
    readonly postMentionedLinks = new ObservableSet<string>()
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
type ValidKeys = {
    [key in keyof PostInfo]: PostInfo[key] extends ObservableMap<any, any> | ObservableSet<any> | ValueRef<any>
        ? key
        : never
}[keyof PostInfo]

export function usePostInfoDetails<K extends ValidKeys>(
    key: K,
): K extends keyof PostInfo
    ? PostInfo[K] extends ValueRef<infer T>
        ? T
        : PostInfo[K] extends ObservableMap<any, infer T> | ObservableSet<infer T>
        ? T[]
        : never
    : never {
    const post = usePostInfo()
    const k: any = post[useRef(key).current as keyof typeof post]
    // eslint-disable-next-line react-hooks/rules-of-hooks
    if (k instanceof ValueRef) return useValueRef(k)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    if (k instanceof ObservableMap) return useObservableValues(k) as any
    // eslint-disable-next-line react-hooks/rules-of-hooks
    if (k instanceof ObservableSet) return useObservableValues(k) as any
    throw new Error()
}

export function usePostInfoSharedPublic(): boolean {
    const info = usePostInfoDetails('postPayload')
    if (info.err) return false
    const payload = info.val
    if (payload.version !== -38) return false
    return !!payload.sharedPublic
}
