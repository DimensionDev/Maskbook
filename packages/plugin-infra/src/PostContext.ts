import {
    ObservableMap,
    ObservableSet,
    PostIVIdentifier,
    type Payload,
    type PostIdentifier,
    type ProfileIdentifier,
} from '@masknet/shared-base'
import { useObservableValues, useValueRef } from '@masknet/shared-base-ui'
import type { TypedMessageTuple } from '@masknet/typed-message'
import { ValueRef, LiveSelector, DOMProxy } from '@dimensiondev/holoflows-kit'
import type { Result, Some } from 'ts-results'
import { createContext, createElement, memo, useContext } from 'react'
import { Subscription, useSubscription } from 'use-subscription'
import type { SupportedPayloadVersions } from '@masknet/encryption'
export interface PostContextSNSActions {
    /** Parse payload into Payload */
    payloadParser(raw: string): Result<Payload, Error>
    /**
     * It will run before parser.
     * @returns a list of candidates of payload string.
     */
    payloadDecoder?(postContent: string): string[]
    getURLFromPostIdentifier?(post: PostIdentifier): URL | null
}
export interface PostContextAuthor {
    readonly nickname: Subscription<string | null>
    readonly avatarURL: Subscription<URL | null>
    readonly author: Subscription<ProfileIdentifier | null>
    /** ID on the SNS network. */
    readonly snsID: Subscription<string | null>
}
export interface PostContextComment {
    readonly commentsSelector: LiveSelector<HTMLElement, false>
    readonly commentBoxSelector: LiveSelector<HTMLElement, false>
}
export interface PostContextCreation extends PostContextAuthor {
    readonly rootElement: DOMProxy
    readonly actionsElement?: DOMProxy
    readonly suggestedInjectionPoint: HTMLElement
    readonly comments?: PostContextComment
    /**
     * The result of this subscription will be merged with `PostContext.postMentionedLinks`.
     *
     * You don't need to provide this to resolve links in `PostContext.postContent`.
     */
    readonly postMentionedLinksProvider?: Subscription<string[]>
    /** @deprecated It should parse image into rawMessage */
    readonly postImagesProvider?: Subscription<string[]>
    /**
     * The raw TypedMessage that the SNS gives.
     */
    readonly rawMessage: Subscription<TypedMessageTuple>
    readonly signal?: AbortSignal
}
export interface PostContext extends PostContextAuthor {
    // #region DOM knowledge
    get rootNode(): HTMLElement | null
    readonly rootElement: DOMProxy
    readonly actionsElement?: DOMProxy
    readonly suggestedInjectionPoint: HTMLElement
    // #endregion
    readonly comment: undefined | PostContextComment
    // #region Metadata of a post (author, mentioned items, ...)
    /** Auto computed */
    readonly identifier: Subscription<null | PostIdentifier>
    readonly url: Subscription<URL | null>
    // Meta
    readonly mentionedLinks: Subscription<string[]>
    /** @deprecated It should appears in rawMessage */
    readonly postMetadataImages: Subscription<string[]>
    // #endregion
    // #region Raw post content (not decrypted)
    readonly rawMessage: Subscription<TypedMessageTuple>
    readonly encryptComment: ValueRef<null | ((commentToEncrypt: string) => Promise<string>)>
    readonly decryptComment: ValueRef<null | ((commentEncrypted: string) => Promise<string | null>)>
    // #endregion
    // #region Post payload discovered in the rawMessage
    readonly containingMaskPayload: Subscription<Result<Payload, unknown>>
    readonly postIVIdentifier: Subscription<PostIVIdentifier | null>
    /**
     * undefined => payload not found
     */
    readonly publicShared: Subscription<boolean | undefined>
    readonly isAuthorOfPost: Subscription<boolean | undefined>
    readonly version: Subscription<SupportedPayloadVersions | undefined>
    decryptedReport(content: {
        sharedPublic?: Some<boolean>
        iv?: string
        isAuthorOfPost?: Some<boolean>
        version?: SupportedPayloadVersions
    }): void
    // #endregion
}
export type PostInfo = PostContext

const Context = createContext<PostContext | null>(null)
export const PostInfoProvider = memo((props: React.PropsWithChildren<{ post: PostInfo }>) => {
    return createElement(Context.Provider, { value: props.post, children: props.children })
})
export function usePostInfo(): PostContext | null {
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
            if (!postInfo) throw new TypeError('No post context')
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
